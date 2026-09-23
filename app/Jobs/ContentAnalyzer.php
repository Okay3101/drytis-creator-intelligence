<?php

namespace App\Jobs;

use App\Models\Content;
use Illuminate\Support\Str;

/**
 * Heuristic content analyzer. Produces the structured intelligence the
 * platform is built on: qualitative diagnosis, Content Health (0–100,
 * internal to Diagnose), and evidence-backed Winning Patterns.
 *
 * In a later phase this can delegate inference to the AI abstraction layer;
 * the heuristics here are the deterministic baseline + validation harness.
 */
class ContentAnalyzer
{
    public static function analyze($contents, array $coverage): array
    {
        $n = $contents->count();
        $metrics = $contents->map(fn ($c) => self::metrics($c));

        $avgViews = $metrics->avg('views') ?: 1;
        $avgReach = $metrics->avg('reach') ?: 1;
        $avgWatch = $metrics->avg('watch');
        $avgLikeRate = $metrics->avg('like_rate');
        $avgCommentRate = $metrics->avg('comment_rate');
        $avgSaveRate = $metrics->avg('save_rate');
        $avgShareRate = $metrics->avg('share_rate');
        $followerGains = $metrics->sum('follower_gains');
        $avgFollowGainPer1k = $metrics->avg('follow_gain_per_1k');

        // Hybrid performance score: follower growth > engagement > views (normalized per account)
        foreach ($contents as $i => $c) {
            $m = $metrics[$i];
            $perf =
                0.40 * min(1, $m['follow_gain_per_1k'] / max(1, $metrics->max('follow_gain_per_1k')))
                + 0.35 * min(1, $m['engagement_rate'] / max(0.001, $metrics->max('engagement_rate')))
                + 0.25 * min(1, $m['views'] / max(1, $metrics->max('views')));
            $c->perf_score = $perf;
        }
        $ranked = $contents->sortByDesc('perf_score')->values();
        $top = $ranked->take(max(3, (int) ceil($n * 0.25)));
        $bottom = $ranked->reverse()->take(max(3, (int) ceil($n * 0.25)));

        // ---- Strengths ----
        $strengths = [];
        if ($avgWatch >= 60) {
            $strengths[] = ['key' => 'watch_time', 'label' => 'Watch time strong hai', 'detail' => "Average watch ".round($avgWatch)."% — log aapki reels poora dekh rahe hain."];
        }
        if ($avgSaveRate >= 1.0) {
            $strengths[] = ['key' => 'saves', 'label' => 'Save rate achha hai', 'detail' => 'Log aapke content ko baad ke liye save kar rahe hain — value-driven content ki nishani.'];
        }
        if ($avgShareRate >= 0.8) {
            $strengths[] = ['key' => 'shares', 'label' => 'Shares solid hain', 'detail' => 'Share-heavy content reach ko organic badhata hai.'];
        }
        if ($avgFollowGainPer1k >= 3) {
            $strengths[] = ['key' => 'follow_conversion', 'label' => 'Views followers mein convert ho rahe hain', 'detail' => 'Per 1000 views aapko average followers mil rahe hain — funnel kaam kar raha hai.'];
        }
        if (empty($strengths)) {
            $strengths[] = ['key' => 'consistency', 'label' => 'Posting consistency', 'detail' => 'Aap regular post kar rahe hain — ye improvement ka base hai.'];
        }

        // ---- Problems (qualitative, prioritized later by severity) ----
        $problems = [];
        $evidence = [];

        if ($avgWatch < 45) {
            $problems[] = [
                'key' => 'weak_hook',
                'label' => 'Hook kamzor hai',
                'severity' => $avgWatch < 30 ? 'critical' : 'needswork',
                'problem' => 'Pehle 3 second mein viewer ko rok nahi pa rahe — bahut log jaldi scroll kar jaate hain.',
                'fix' => 'First 3 seconds mein ek sawaal, surprising line ya bold claim daalo. "Ye dekho" ki jagah seedha value batao.',
            ];
            $evidence['weak_hook'] = "Average watch completion sirf ".round($avgWatch)."% hai across {$n} reels.";
        }

        if ($avgCommentRate < 0.3) {
            $problems[] = [
                'key' => 'low_engagement',
                'label' => 'Comments bahut kam hain',
                'severity' => 'needswork',
                'problem' => 'Content dekha ja raha hai par log respond nahi kar rahe — engagement shallow hai.',
                'fix' => 'Har reel ke end mein ek specific sawaal poochho ya "comment karo X agar..." prompt do. Controversial (par respectful) takes bhi kaam karte hain.',
            ];
            $evidence['low_engagement'] = 'Comment rate '.round($avgCommentRate, 2).'% vs healthy 0.5%+ benchmark.';
        }

        if ($avgSaveRate < 0.5 && $avgShareRate < 0.5) {
            $problems[] = [
                'key' => 'low_value_density',
                'label' => 'Content save/share nahi ho raha',
                'severity' => 'average',
                'problem' => 'Log dekh ke nikal jaate hain — content itna valuable nahi lag raha ki save ya share karein.',
                'fix' => 'Ek reel = one actionable takeaway. Checklists, step-by-step ya "iske bina mat karo" wale points daalo jo log baad mein chahein.',
            ];
            $evidence['low_value_density'] = 'Save rate '.round($avgSaveRate, 2).'% aur share rate '.round($avgShareRate, 2).'% — dono neeche.';
        }

        if ($avgFollowGainPer1k < 1.5) {
            $problems[] = [
                'key' => 'weak_conversion',
                'label' => 'Views followers nahi ban rahe',
                'severity' => 'needswork',
                'problem' => 'Reach achhi ho sakti hai par profile visit karke follow bahut kam log kar rahe hain.',
                'fix' => 'Reel ke end mein "follow karo kyunki..." wala ek clear reason do — aage kya milega wo batao. Profile bio bhi tighten karo.',
            ];
            $evidence['weak_conversion'] = 'Per 1000 views sirf '.round($avgFollowGainPer1k, 1).' followers convert ho rahe hain.';
        }

        $captions = $contents->pluck('caption')->filter()->join(' ');
        if (str_word_count($captions) / max(1, $n) < 15) {
            $problems[] = [
                'key' => 'thin_captions',
                'label' => 'Captions bahut chhote hain',
                'severity' => 'average',
                'problem' => 'Captions almost empty hain — search aur saves dono ka mauka miss ho raha hai.',
                'fix' => 'Caption mein 2–3 lines value + 3–5 relevant hashtags daalo. Instagram search captions ko index karta hai.',
            ];
            $evidence['thin_captions'] = 'Average caption length '.round(str_word_count($captions) / max(1, $n)).' words hai.';
        }

        // Prioritize: Top 3 "Fix First"
        $order = ['critical' => 0, 'needswork' => 1, 'average' => 2, 'good' => 3];
        usort($problems, fn ($a, $b) => ($order[$a['severity']] ?? 9) <=> ($order[$b['severity']] ?? 9));
        $topProblems = array_slice($problems, 0, 3);
        $secondary = array_slice($problems, 3);

        // ---- Content Health 0–100 (weighted, normalized) ----
        $health = 50.0
            + 20 * min(1, $avgWatch / 75)
            + 12 * min(1, $avgLikeRate / 5)
            + 8 * min(1, $avgCommentRate / 0.8)
            + 6 * min(1, $avgSaveRate / 1.5)
            + 4 * min(1, $avgFollowGainPer1k / 5);
        $criticalCount = count(array_filter($problems, fn ($p) => $p['severity'] === 'critical'));
        $health = (int) round(max(5, min(98, $health - 6 * $criticalCount)));

        $confidence = $n >= 20 ? 'high' : ($n >= 10 ? 'moderate' : 'low');

        // ---- Winning Patterns (evidence-based) ----
        $patterns = [];
        $topCaptions = $top->pluck('caption')->filter();
        $commonHashtags = self::commonHashtags($topCaptions);
        $avgTopDur = $top->avg('duration_seconds');
        $avgAllDur = $contents->avg('duration_seconds');

        if ($commonHashtags->isNotEmpty()) {
            $patterns[] = [
                'category' => 'hashtags',
                'title' => 'Ye hashtags aapke top reels mein repeat ho rahe hain',
                'pattern' => ['#'.implode(' #', $commonHashtags->take(5)->all())],
                'evidence' => ['detail' => "{$top->count()} of your strongest Reels use these hashtags; aapke baaki reels mein ye kam aate hain."],
                'confidence' => $n >= 10 ? 'moderate' : 'low',
            ];
        }
        if ($avgTopDur && $avgAllDur && abs($avgTopDur - $avgAllDur) > 3) {
            $better = $avgTopDur < $avgAllDur ? 'chhoti' : 'lambi';
            $patterns[] = [
                'category' => 'duration',
                'title' => ucfirst($better).' reels aapke liye better perform karti hain',
                'pattern' => ['optimal_duration' => round($avgTopDur)],
                'evidence' => ['detail' => 'Top reels average '.round($avgTopDur).'s vs '.round($avgAllDur).'s overall.'],
                'confidence' => 'moderate',
            ];
        }
        $topHookRate = $top->avg(fn ($c) => self::metrics($c)['watch']);
        if ($topHookRate && $topHookRate > $avgWatch + 8) {
            $patterns[] = [
                'category' => 'retention',
                'title' => 'Top reels mein retention clearly zyada hai',
                'pattern' => ['watch_completion' => round($topHookRate)],
                'evidence' => ['detail' => "Aapki {$top->count()} strongest reels ka watch completion ".round($topHookRate)."% hai vs ".round($avgWatch)."% average — unka hook/structure dekho aur repeat karo."],
                'confidence' => 'moderate',
            ];
        }
        if (empty($patterns)) {
            $patterns[] = [
                'category' => 'general',
                'title' => 'Limited data available',
                'pattern' => [],
                'evidence' => ['detail' => 'Abhi itna data nahi hai ki koi clear pattern nikle. 5–10 aur reels post karne par patterns unlock honge.'],
                'confidence' => 'low',
            ];
        }

        return [
            'problems' => $problems,
            'top_problem_keys' => array_column($topProblems, 'key'),
            'strengths' => $strengths,
            'evidence' => $evidence,
            'recommendations' => array_map(fn ($p) => ['key' => $p['key'], 'label' => $p['label'], 'fix' => $p['fix']], $topProblems),
            'secondary_observations' => array_map(fn ($p) => ['key' => $p['key'], 'label' => $p['label'], 'fix' => $p['fix']], $secondary),
            'content_health' => $health,
            'confidence' => $confidence,
            'stats' => [
                'avg_watch' => round($avgWatch),
                'avg_like_rate' => round($avgLikeRate, 2),
                'avg_comment_rate' => round($avgCommentRate, 2),
                'avg_save_rate' => round($avgSaveRate, 2),
                'follower_gains_total' => (int) $followerGains,
                'reels_analyzed' => $n,
            ],
            'patterns' => $patterns,
        ];
    }

    private static function metrics(Content $c): array
    {
        $i = $c->insights ?? [];
        $views = (float) ($i['plays'] ?? $i['views'] ?? 0);
        $reach = (float) ($i['reach'] ?? 0) ?: $views;
        $likes = (float) ($i['likes'] ?? 0);
        $comments = (float) ($i['comments'] ?? 0);
        $saves = (float) ($i['saved'] ?? 0);
        $shares = (float) ($i['shares'] ?? 0);

        return [
            'views' => $views,
            'reach' => $reach,
            'watch' => (float) ($i['watch_percent_avg'] ?? 50),
            'like_rate' => $views ? 100 * $likes / $views : 0,
            'comment_rate' => $views ? 100 * $comments / $views : 0,
            'save_rate' => $views ? 100 * $saves / $views : 0,
            'share_rate' => $views ? 100 * $shares / $views : 0,
            'engagement_rate' => $views ? 100 * ($likes + $comments + $saves + $shares) / $views : 0,
            'follower_gains' => (float) ($i['follower_gains'] ?? 0),
            'follow_gain_per_1k' => $views ? 1000 * (float) ($i['follower_gains'] ?? 0) / $views : 0,
        ];
    }

    private static function commonHashtags($captions)
    {
        $counts = [];
        foreach ($captions as $caption) {
            preg_match_all('/#([\p{L}\p{N}_]+)/u', $caption ?? '', $m);
            foreach (array_unique($m[1]) as $tag) {
                $counts[$tag] = ($counts[$tag] ?? 0) + 1;
            }
        }
        arsort($counts);

        return collect(array_keys(array_filter($counts, fn ($c) => $c >= 2)));
    }
}
