<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Script;
use App\Services\ScriptGeneratorService;
use Illuminate\Http\Request;

class ScriptController extends Controller
{
    public function generate(Request $r)
    {
        $data = $r->validate([
            'idea' => 'required|string|min:3|max:2000',
            'mode' => 'nullable|in:production,voiceover',
            'instagram_account_id' => 'nullable|integer',
            'toggles' => 'nullable|array|size:3',
            'toggles.winning_patterns' => 'required|boolean',
            'toggles.competitor_insights' => 'required|boolean',
            'toggles.trends' => 'required|boolean',
            'objectives' => 'nullable|string|max:500',
            'language_note' => 'nullable|string|max:200',
        ]);

        // default all toggles OFF — intelligence is never auto-enabled
        $toggles = [
            'winning_patterns' => (bool) ($data['toggles']['winning_patterns'] ?? false),
            'competitor_insights' => (bool) ($data['toggles']['competitor_insights'] ?? false),
            'trends' => (bool) ($data['toggles']['trends'] ?? false),
        ];

        $script = Script::create([
            'creator_id' => $r->user()->id,
            'instagram_account_id' => $data['instagram_account_id'] ?? null,
            'idea' => $data['idea'],
            'inputs' => [
                'objectives' => $data['objectives'] ?? null,
                'language_note' => $data['language_note'] ?? null,
            ],
            'toggles' => $toggles,
            'mode' => $data['mode'] ?? 'production',
            'status' => 'generating',
        ]);

        $script = app(ScriptGeneratorService::class)->generate($script);

        return response()->json(['data' => $this->payload($script)], 201);
    }

    public function revise(Request $r, string $id)
    {
        $data = $r->validate([
            'instruction' => 'required|string|min:3|max:1000',
        ]);

        $original = Script::where('creator_id', $r->user()->id)->findOrFail($id);

        $script = Script::create([
            'creator_id' => $r->user()->id,
            'instagram_account_id' => $original->instagram_account_id,
            'idea' => $original->idea,
            'inputs' => $original->inputs,
            'toggles' => $original->toggles,
            'mode' => $original->mode,
            'revision_of' => $original->id,
            'revision_instruction' => $data['instruction'],
            'status' => 'generating',
        ]);

        $script = app(ScriptGeneratorService::class)->generate($script);

        return response()->json(['data' => $this->payload($script)], 201);
    }

    public function history(Request $r)
    {
        $scripts = Script::where('creator_id', $r->user()->id)
            ->orderByDesc('created_at')->limit(30)
            ->get()->map(fn ($s) => $this->payload($s));

        return response()->json(['data' => $scripts]);
    }

    public function show(Request $r, string $id)
    {
        $script = Script::where('creator_id', $r->user()->id)->findOrFail($id);

        return response()->json(['data' => $this->payload($script)]);
    }

    private function payload(Script $s): array
    {
        return [
            'id' => $s->id,
            'idea' => $s->idea,
            'mode' => $s->mode,
            'toggles' => $s->toggles,
            'script' => $s->script,
            'status' => $s->status,
            'revision_of' => $s->revision_of,
            'revision_instruction' => $s->revision_instruction,
            'created_at' => $s->created_at?->toIso8601String(),
        ];
    }
}
