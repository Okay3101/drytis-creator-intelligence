<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeReelReadiness;
use App\Models\ReelReadiness;
use App\Models\Script;
use App\Models\Upload;
use App\Services\ScriptGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReadinessController extends Controller
{
    private const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB
    private const ALLOWED_MIMES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];

    public function uploadMedia(Request $r)
    {
        $r->validate(['media' => 'required|file|max:'.(self::MAX_UPLOAD_BYTES / 1024)]);

        $file = $r->file('media');
        if (! in_array($file->getMimeType(), self::ALLOWED_MIMES, true)) {
            return response()->json([
                'message' => 'Sirf MP4 ya MOV video chalti hai. Video ko MP4 (H.264) mein convert karke dobara try karo.',
            ], 422);
        }

        $path = 'readiness/'.$r->user()->id.'/'.Str::uuid().'.'.$file->getClientOriginalExtension();
        $file->storeAs('readiness/'.$r->user()->id, basename($path));

        $upload = Upload::create([
            'user_id' => $r->user()->id,
            'path' => $path,
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
            'validation_status' => 'valid',
            'retention_delete_at' => now()->addDays((int) (\App\Services\SettingsService::get('uploads.retention_days', 30))),
        ]);

        return response()->json(['data' => ['upload_id' => $upload->id, 'path' => $path]], 201);
    }

    public function submit(Request $r)
    {
        $data = $r->validate([
            'media_path' => 'required|string',
            'caption' => 'nullable|string|max:2200',
            'cover_path' => 'nullable|string',
            'hashtags' => 'nullable|string|max:1000',
            'audio' => 'nullable|string|max:200',
            'objectives' => 'nullable|string|max:500',
            'previous_attempt_id' => 'nullable|integer',
        ]);

        $attempt = ReelReadiness::create([
            'creator_id' => $r->user()->id,
            'media_path' => $data['media_path'],
            'inputs' => collect($data)->only(['caption', 'cover_path', 'hashtags', 'audio', 'objectives'])->all(),
            'status' => 'pending',
            'previous_attempt_id' => $data['previous_attempt_id'] ?? null,
        ]);

        AnalyzeReelReadiness::dispatch($attempt);

        return response()->json([
            'message' => 'Reel check ho rahi hai — 10–20 second mein score ready.',
            'data' => ['id' => $attempt->id, 'status' => $attempt->status],
        ], 201);
    }

    public function show(Request $r, string $id)
    {
        $attempt = ReelReadiness::where('creator_id', $r->user()->id)->findOrFail($id);

        return response()->json(['data' => [
            'id' => $attempt->id,
            'status' => $attempt->status,
            'score' => $attempt->score,
            'label' => $attempt->label,
            'strengths' => $attempt->strengths,
            'problems' => $attempt->problems,
            'error' => $attempt->error,
            'previous_attempt_id' => $attempt->previous_attempt_id,
            'created_at' => $attempt->created_at?->toIso8601String(),
        ]]);
    }

    public function history(Request $r)
    {
        $attempts = ReelReadiness::where('creator_id', $r->user()->id)
            ->orderByDesc('created_at')->limit(20)
            ->get(['id', 'score', 'label', 'status', 'previous_attempt_id', 'created_at'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'score' => $a->score,
                'label' => $a->label,
                'status' => $a->status,
                'previous_attempt_id' => $a->previous_attempt_id,
                'created_at' => $a->created_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $attempts]);
    }
}
