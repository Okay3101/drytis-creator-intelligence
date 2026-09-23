<?php

namespace App\Jobs;

/**
 * Heuristic pre-publish readiness checker. Scores CRAFT READINESS (1–10):
 * technical + structural quality of the reel before posting. It NEVER
 * predicts performance — no views/followers/virality estimates anywhere.
 *
 * Uses ffprobe (when available) for technical checks + caption/metadata
 * heuristics. Deterministic baseline; AI enrichment can layer on later.
 */
class ReelReadinessChecker
{
    private const REQUIRED_SECONDS_MIN = 5;
    private const REQUIRED_SECONDS_MAX = 90;

    public static function check(string $absolutePath, array $inputs): array
    {
        $strengths = [];
        $problems = [];
        $score = 10.0;

        $meta = self::probe($absolutePath);
        $caption = trim((string) ($inputs['caption'] ?? ''));
        $hashtags = self::extractHashtags($inputs['hashtags'] ?? ($caption ? $caption : ''));
        $hasCover = ! empty($inputs['cover_path']);
        $hasAudio = ! empty($inputs['audio']);
        $objectives = trim((string) ($inputs['objectives'] ?? ''));

        // ---- Technical: duration ----
        $duration = $meta['duration'] ?? null;
        if ($duration === null) {
            $problems[] = ['key' => 'duration_unknown', 'label' => 'Video duration check nahi ho paya', 'fix' => 'MP4 (H.264) format mein 5–90 second ki reel upload karo.'];
            $score -= 1.0;
        } elseif ($duration < self::REQUIRED_SECONDS_MIN) {
            $problems[] = ['key' => 'too_short', 'label' => 'Reel bahut chhoti hai', 'fix' => 'Kam se kam 5 second ki reel banao — chhoti clips reach ke liye enough nahi hoti.'];
            $score -= 2.0;
        } elseif ($duration > self::REQUIRED_SECONDS_MAX) {
            $problems[] = ['key' => 'too_long', 'label' => 'Reel bahut lambi hai', 'fix' => '90 second se neeche rakho — tight editing retention ke liye better hota hai.'];
            $score -= 1.5;
        } else {
            $strengths[] = ['key' => 'duration', 'label' => 'Duration sahi zone mein hai ('.round($duration).'s)'];
        }

        // ---- Technical: resolution ----
        $width = $meta['width'] ?? null;
        $height = $meta['height'] ?? null;
        if ($width && $height) {
            $ratio = $height / max(1, $width);
            if ($ratio < 1.2) {
                $problems[] = ['key' => 'not_vertical', 'label' => 'Video vertical (9:16) nahi lag rahi', 'fix' => '1080×1920 (9:16) export karo — Reels full-screen format hai.'];
                $score -= 1.5;
            } else {
                $strengths[] = ['key' => 'format', 'label' => 'Vertical format correct hai'];
            }
        }

        // ---- Caption ----
        $words = str_word_count($caption);
        if ($words === 0) {
            $problems[] = ['key' => 'no_caption', 'label' => 'Caption missing hai', 'fix' => '2–3 lines ka caption daalo — search aur saves dono ke liye matter karta hai.'];
            $score -= 1.5;
        } elseif ($words < 10) {
            $problems[] = ['key' => 'thin_caption', 'label' => 'Caption bahut chhota hai', 'fix' => 'Caption mein value + context add karo (min ~10 words).'];
            $score -= 0.5;
        } else {
            $strengths[] = ['key' => 'caption', 'label' => 'Caption solid hai ('.$words.' words)'];
        }

        // ---- Hashtags ----
        if (count($hashtags) === 0) {
            $problems[] = ['key' => 'no_hashtags', 'label' => 'Koi hashtag nahi hai', 'fix' => '3–5 relevant hashtags add karo — niche + format mix rakho.'];
            $score -= 1.0;
        } elseif (count($hashtags) > 15) {
            $problems[] = ['key' => 'hashtag_spam', 'label' => 'Bahut zyada hashtags', 'fix' => '3–5 focused hashtags rakho — spammy lagta hai.'];
            $score -= 0.5;
        } else {
            $strengths[] = ['key' => 'hashtags', 'label' => count($hashtags).' relevant hashtags'];
        }

        // ---- Cover ----
        if (! $hasCover) {
            $problems[] = ['key' => 'no_cover', 'label' => 'Cover frame set nahi kiya', 'fix' => 'Ek clean, readable cover choose karo — profile grid pehle dikhta hai.'];
            $score -= 0.5;
        } else {
            $strengths[] = ['key' => 'cover', 'label' => 'Cover frame set hai'];
        }

        // ---- Audio intent ----
        if (! $hasAudio) {
            $problems[] = ['key' => 'no_audio', 'label' => 'Audio choice note nahi ki', 'fix' => 'Trending ya original audio select karo — Reels audio-heavy format hai.'];
            $score -= 0.5;
        } else {
            $strengths[] = ['key' => 'audio', 'label' => 'Audio planned hai'];
        }

        // ---- Objectives ----
        if ($objectives === '') {
            $problems[] = ['key' => 'no_objective', 'label' => 'Goal define nahi kiya', 'fix' => 'Ek line likho is reel se kya chahiye (reach/follows/saves) — hook aur CTA uske hisaab se strong hote hain.'];
            $score -= 0.5;
        } else {
            $strengths[] = ['key' => 'objective', 'label' => 'Clear objective set hai'];
        }

        $score = max(1.0, min(10.0, round($score, 1)));
        $label = self::label($score);

        return [
            'score' => $score,
            'label' => $label,
            'strengths' => $strengths,
            'problems' => $problems,
        ];
    }

    public static function label(float $score): string
    {
        return match (true) {
            $score >= 9.0 => 'Ready to Post',
            $score >= 7.5 => 'Almost Ready',
            $score >= 5.5 => 'Needs Polish',
            $score >= 3.5 => 'Needs Work',
            default => 'Rework First',
        };
    }

    private static function extractHashtags(string $text): array
    {
        preg_match_all('/#([\p{L}\p{N}_]+)/u', $text, $m);

        return array_values(array_unique($m[1]));
    }

    private static function probe(string $path): array
    {
        if (! is_file($path)) {
            return [];
        }

        $out = @shell_exec('ffprobe -v quiet -print_format json -show_format -show_streams '.escapeshellarg($path).' 2>/dev/null');
        if (! $out) {
            return [];
        }

        $json = json_decode($out, true);
        $video = collect($json['streams'] ?? [])->firstWhere('codec_type', 'video') ?? [];

        return [
            'duration' => isset($json['format']['duration']) ? (float) $json['format']['duration'] : null,
            'width' => $video['width'] ?? null,
            'height' => $video['height'] ?? null,
        ];
    }
}
