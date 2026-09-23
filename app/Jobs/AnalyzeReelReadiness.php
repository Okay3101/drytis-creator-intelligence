<?php

namespace App\Jobs;

use App\Models\ReelReadiness;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AnalyzeReelReadiness implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public ReelReadiness $attempt)
    {
    }

    public function handle(): void
    {
        $attempt = $this->attempt->refresh();
        $attempt->update(['status' => 'running']);

        try {
            $result = ReelReadinessChecker::check(
                storage_path('app/'.$attempt->media_path),
                $attempt->inputs ?? []
            );

            $attempt->update([
                'score' => $result['score'],
                'label' => $result['label'],
                'strengths' => $result['strengths'],
                'problems' => $result['problems'],
                'status' => 'completed',
            ]);

            app(NotificationService::class)->notify(
                $attempt->creator,
                'system', 'readiness.completed',
                "Reel Readiness: {$result['label']} 🎬",
                'Score '.$result['score'].'/10 — strengths aur fixes Diagnose > Readiness mein dekho.'
            );
        } catch (\Throwable $e) {
            $attempt->update(['status' => 'failed', 'error' => substr($e->getMessage(), 0, 500)]);

            throw $e;
        }
    }
}
