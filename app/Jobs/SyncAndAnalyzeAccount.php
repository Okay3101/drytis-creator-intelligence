<?php

namespace App\Jobs;

use App\Models\Analysis;
use App\Models\Content;
use App\Models\Diagnosis;
use App\Models\InstagramAccount;
use App\Models\WinningPattern;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncAndAnalyzeAccount implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public InstagramAccount $account, public string $type = 'initial')
    {
    }

    public function handle(): void
    {
        $account = $this->account->refresh();
        $provider = \App\Services\Instagram\InstagramAccountService::provider();

        $analysis = Analysis::create([
            'instagram_account_id' => $account->id,
            'type' => $this->type,
            'status' => 'running',
        ]);

        try {
            // ---- 1. Sync reels (idempotent by unique media id) ----
            $reels = $provider->reels($account);
            $newCount = 0;
            foreach ($reels as $reel) {
                $insights = $reel['demo_insights'] ?? $provider->insights($account, $reel['id']);
                Content::updateOrCreate(
                    ['instagram_account_id' => $account->id, 'ig_media_id' => $reel['id']],
                    [
                        'media_type' => 'REEL',
                        'permalink' => $reel['permalink'] ?? null,
                        'thumbnail_url' => $reel['thumbnail_url'] ?? null,
                        'caption' => $reel['caption'] ?? null,
                        'duration_seconds' => $reel['duration'] ?? null,
                        'insights' => $insights,
                        'posted_at' => $reel['timestamp'] ?? null,
                    ]
                );
                $newCount++;
            }
            $account->update(['last_synced_at' => now()]);

            // ---- 2. Minimum gate ----
            $reelCount = $account->contents()->where('media_type', 'REEL')->count();
            $coverage = [
                'reels_count' => $reelCount,
                'period_days' => 90,
                'completeness' => $reelCount >= 10 ? 'good' : ($reelCount >= 5 ? 'partial' : 'insufficient'),
            ];
            $analysis->update(['data_coverage' => $coverage]);

            if ($reelCount < 5) {
                $analysis->update([
                    'status' => 'completed',
                    'results' => ['blocked' => 'minimum_reels', 'message' => 'Diagnosis ke liye kam se kam 5 Reels chahiye. Abhi '.$reelCount.' Reels mila. Aur Reels post karo ya sync dobara chalao — phir poora analysis milega.'],
                ]);
                app(NotificationService::class)->notify(
                    $account->creator,
                    'system', 'analysis.incomplete',
                    'Analysis adhoora — Reels kam hain',
                    'Kam se kam 5 Reels chahiye diagnosis ke liye. Abhi '.$reelCount.' mile.'
                );

                return;
            }

            // ---- 3. Analyze ----
            $contents = $account->contents()->where('media_type', 'REEL')->orderByDesc('posted_at')->get();
            $result = ContentAnalyzer::analyze($contents, $coverage);

            // ---- 4. Persist diagnosis + patterns ----
            Diagnosis::create([
                'instagram_account_id' => $account->id,
                'problems' => $result['problems'],
                'strengths' => $result['strengths'],
                'evidence' => $result['evidence'],
                'recommendations' => $result['recommendations'],
                'top_problem_keys' => $result['top_problem_keys'],
                'content_health' => $result['content_health'],
            ]);

            WinningPattern::where('instagram_account_id', $account->id)->delete();
            foreach ($result['patterns'] as $p) {
                WinningPattern::create([
                    'instagram_account_id' => $account->id,
                    'category' => $p['category'] ?? null,
                    'pattern' => $p,
                    'evidence' => $p['evidence'] ?? null,
                    'confidence' => $p['confidence'] ?? 'moderate',
                ]);
            }

            $analysis->update(['status' => 'completed', 'confidence' => $result['confidence'] ?? 'moderate']);

            app(NotificationService::class)->notify(
                $account->creator,
                'system', 'analysis.completed',
                'Aapka content analysis ready hai 🔍',
                'Diagnosis, Content Health aur Winning Patterns taiyar hain — Diagnose kholo.'
            );
        } catch (\Throwable $e) {
            Log::error('Analysis failed for account '.$account->id.': '.$e->getMessage());
            $analysis->update(['status' => 'failed', 'error' => substr($e->getMessage(), 0, 500)]);
            app(NotificationService::class)->notify(
                $account->creator,
                'system', 'analysis.failed',
                'Analysis fail ho gaya',
                'Kuch galat ho gaya — thodi der baad refresh try karo.'
            );

            throw $e;
        }
    }
}
