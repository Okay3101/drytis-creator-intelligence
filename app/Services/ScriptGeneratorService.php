<?php

namespace App\Services;

use App\Models\Content;
use App\Models\CreatorProfile;
use App\Models\Diagnosis;
use App\Models\InstagramAccount;
use App\Models\Script;
use App\Models\WinningPattern;
use App\Services\AI\AiGateway;

class ScriptGeneratorService
{
    public function __construct(private AiGateway $ai)
    {
    }

    /**
     * Build the generation context. Only intelligence from explicitly-enabled
     * toggles is included — disabled toggles demonstrably never inject data.
     */
    public function buildContext(Script $script): array
    {
        $creator = $script->creator;
        $profile = CreatorProfile::where('user_id', $creator->id)->first();
        $account = $script->instagram_account_id
            ? InstagramAccount::find($script->instagram_account_id)
            : InstagramAccount::where('creator_id', $creator->id)->orderBy('created_at')->first();
        $script->instagram_account_id = $account?->id ?? $script->instagram_account_id;

        $toggles = $script->toggles ?? [];
        $context = [
            'creator' => [
                'name' => $creator->name,
                'niche' => $profile->niche ?? null,
                'language' => 'Hinglish-first (Roman Hindi + English mix), natural not shuddh',
                'style' => $profile->style ?? null,
                'content_goal' => $profile->objectives['primary'] ?? null,
                'objectives' => $script->inputs['objectives'] ?? null,
            ],
            'intelligence_used' => [],
        ];

        if (($toggles['winning_patterns'] ?? false) && $account) {
            $patterns = WinningPattern::where('instagram_account_id', $account->id)
                ->orderByDesc('created_at')->limit(5)->get()
                ->map(fn ($p) => [
                    'title' => $p->pattern['title'] ?? null,
                    'evidence' => $p->evidence['detail'] ?? null,
                ])->filter(fn ($p) => $p['title'])->values()->all();
            if ($patterns) {
                $context['winning_patterns'] = $patterns;
                $context['intelligence_used'][] = 'winning_patterns';
            }
        } else {
            $context['reduced_context_note'] = 'Winning Patterns toggle off ya data nahi — script general best-practice pe banegi.';
        }

        if (($toggles['competitor_insights'] ?? false) && $account) {
            $context['competitor_insights'] = $this->competitorSummary($account);
            if ($context['competitor_insights']) {
                $context['intelligence_used'][] = 'competitor_insights';
            }
        }

        if (($toggles['trends'] ?? false)) {
            $context['trends'] = $this->trendsSummary($profile);
            if ($context['trends']) {
                $context['intelligence_used'][] = 'trends';
            }
        }

        if ($account) {
            $diag = $account->latestDiagnosis()->first();
            if ($diag) {
                // Top problems always inform the script (creator-specific core, not a toggle)
                $context['fix_focus'] = collect($diag->top_problem_keys ?? [])
                    ->map(fn ($k) => collect($diag->problems ?? [])->firstWhere('key', $k)['fix'] ?? null)
                    ->filter()->values()->all();
            }
        }

        return $context;
    }

    private function competitorSummary($account): ?array
    {
        $competitor = \App\Models\Competitor::where('instagram_account_id', $account->id)
            ->orderByDesc('created_at')->first();

        return $competitor?->insights;
    }

    private function trendsSummary($profile): ?array
    {
        // Trends relevant to the creator's niche, any state (Emerging/Trending preferred)
        return \App\Models\Trend::when($profile->niche ?? null, fn ($q, $n) => $q->where('niche', $n))
            ->orderByDesc('updated_at')->limit(5)
            ->get()->map(fn ($t) => [
                'topic' => $t->title,
                'state' => $t->status,
                'type' => $t->type,
            ])->values()->all() ?: null;
    }

    public function generate(Script $script): Script
    {
        $context = $this->buildContext($script);
        $voiceover = $script->mode === 'voiceover';

        $system = <<<SYS
You are a top short-form Reels scriptwriter for Indian creators (0–10K followers).
Write in natural Hinglish (Roman script Hindi + English mix), the way real creators talk.
STRICT RULES:
- Output ONLY valid JSON, no markdown fences, no commentary.
- NEVER predict, promise, or estimate performance: no views, reach, followers, virality, "this will get X". Describe craft quality only.
- Output ONE production-ready script.
- Approximate timings are fine; label them "approx".
JSON shape:
{
  "hook": {"line": "...", "visual": "...", "timing": "0-3s approx"},
  "body": [{"beat": "...", "visual": "...", "audio": "...", "on_screen_text": "...", "timing": "approx"}],
  "pacing": "...",
  "cta": {"line": "...", "visual": "...", "timing": "approx"},
  "caption": "...",
  "hashtags": ["#..."],
  "voiceover_only": ["line1", "line2", ...]  // only when mode=voiceover
}
SYS;

        if ($voiceover) {
            $system .= "\nMODE: VOICEOVER-ONLY. 'body' may stay brief; 'voiceover_only' must contain the complete spoken script lines in order, nothing else added on screen.";
        }

        $user = "Idea: {$script->idea}\n\nCreator context:\n"
            .json_encode($context['creator'], JSON_UNESCAPED_UNICODE)."\n\n"
            ."Intelligence included (ONLY these): ".(implode(', ', $context['intelligence_used']) ?: 'none')."\n";

        if (! empty($context['winning_patterns'])) {
            $user .= "\nWinning Patterns (evidence-backed):\n".json_encode($context['winning_patterns'], JSON_UNESCAPED_UNICODE)."\n";
        }
        if (! empty($context['competitor_insights'])) {
            $user .= "\nCompetitor insights:\n".json_encode($context['competitor_insights'], JSON_UNESCAPED_UNICODE)."\n";
        }
        if (! empty($context['trends'])) {
            $user .= "\nCurrent trends:\n".json_encode($context['trends'], JSON_UNESCAPED_UNICODE)."\n";
        }
        if (! empty($context['fix_focus'])) {
            $user .= "\nAddress these creator-specific fixes:\n".json_encode($context['fix_focus'], JSON_UNESCAPED_UNICODE)."\n";
        }
        if ($script->revision_of && $script->revision_instruction) {
            $original = Script::find($script->revision_of);
            $user .= "\nREVISE the previous script. Instruction: {$script->revision_instruction}\n"
                ."Preserve every part not touched by the instruction, verbatim where possible.\n"
                ."Previous script JSON:\n".json_encode($original?->script, JSON_UNESCAPED_UNICODE)."\n";
        }

        $json = $this->ai->chatJson([
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ]);

        if ($json === null) {
            // Deterministic fallback so the product still works end-to-end.
            $json = $this->fallbackScript($script, $context, $voiceover);
        }

        $script->script = $json;
        $script->status = 'completed';
        $script->save();

        return $script;
    }

    private function fallbackScript(Script $script, array $context, bool $voiceover): array
    {
        $hook = 'Ruko! Ye cheez 90% log galat karte hain — aur shayad tum bhi.';

        return [
            'hook' => ['line' => $hook, 'visual' => 'Close-up, direct eye contact, quick zoom-in', 'timing' => '0-3s approx'],
            'body' => [
                ['beat' => 'Problem setup — dikhao ki issue common hai', 'visual' => 'Relatable scenario B-roll', 'audio' => 'Trending soft beat', 'on_screen_text' => 'Sound familiar?', 'timing' => '3-10s approx'],
                ['beat' => 'Solution reveal — step 1', 'visual' => 'Screen-record ya demo shot', 'audio' => 'Beat continue', 'on_screen_text' => 'Step 1', 'timing' => '10-20s approx'],
                ['beat' => 'Proof/extra tip', 'visual' => 'Before-after ya quick cut', 'audio' => 'Beat drop', 'on_screen_text' => 'Bonus tip', 'timing' => '20-27s approx'],
            ],
            'pacing' => 'Fast cuts every 2-3s, energetic delivery, ek beat mein ek point.',
            'cta' => ['line' => 'Follow karo for more — agla part even better hai.', 'visual' => 'Point at follow button', 'timing' => '27-30s approx'],
            'caption' => $script->idea.' — full breakdown reels mein! Save karo, baad mein kaam aayega.',
            'hashtags' => ['#reels', '#trending', '#hinglish', '#creator'],
            'voiceover_only' => $voiceover ? [$hook, 'Suno — ye problem sab ke saath hoti hai.', 'Step ek: seedha point banao.', 'Aur follow karo, aise hi value milti rahegi.'] : [],
            '_fallback' => true,
            '_note' => 'AI gateway unavailable — deterministic template used.',
        ];
    }
}
