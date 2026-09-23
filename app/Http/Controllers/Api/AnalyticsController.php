<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\InstagramAccount;
use Illuminate\Http\Request;

/**
 * Analytics = "what happened" reporting from legitimately available
 * insights. Clearly separate from Diagnose (which is "what to fix").
 * Demo data is labeled is_demo.
 */
class AnalyticsController extends Controller
{
    public function overview(Request $r)
    {
        $account = $this->accountFor($r);
        if (! $account) {
            return response()->json(['empty' => true, 'message' => 'Analytics ke liye pehle Instagram account connect karo.']);
        }

        $contents = Content::where('instagram_account_id', $account->id)
            ->where('media_type', 'REEL')
            ->orderByDesc('posted_at')->get();

        $views = $contents->map(fn ($c) => (int) ($c->insights['plays'] ?? $c->insights['views'] ?? 0));
        $reach = $contents->map(fn ($c) => (int) ($c->insights['reach'] ?? 0));
        $likes = $contents->sum(fn ($c) => (int) ($c->insights['likes'] ?? 0));
        $comments = $contents->sum(fn ($c) => (int) ($c->insights['comments'] ?? 0));
        $saves = $contents->sum(fn ($c) => (int) ($c->insights['saved'] ?? 0));
        $shares = $contents->sum(fn ($c) => (int) ($c->insights['shares'] ?? 0));
        $totalViews = $views->sum();

        $perReel = $contents->map(fn ($c) => [
            'id' => $c->id,
            'posted_at' => $c->posted_at?->toIso8601String(),
            'caption' => \Illuminate\Support\Str::limit((string) $c->caption, 60),
            'thumbnail_url' => $c->thumbnail_url,
            'views' => (int) ($c->insights['plays'] ?? $c->insights['views'] ?? 0),
            'reach' => (int) ($c->insights['reach'] ?? 0),
            'likes' => (int) ($c->insights['likes'] ?? 0),
            'comments' => (int) ($c->insights['comments'] ?? 0),
            'saves' => (int) ($c->insights['saved'] ?? 0),
            'engagement_rate' => $this->engagementRate($c),
        ]);

        $sorted = $perReel->sortByDesc('views')->values();

        return response()->json(['data' => [
            'account' => [
                'id' => $account->id,
                'username' => $account->username,
                'is_demo' => \Illuminate\Support\Str::startsWith($account->ig_user_id, 'demo-'),
            ],
            'totals' => [
                'reels' => $contents->count(),
                'views' => $totalViews,
                'reach' => $reach->sum(),
                'likes' => $likes,
                'comments' => $comments,
                'saves' => $saves,
                'shares' => $shares,
                'avg_engagement_rate' => round($perReel->avg('engagement_rate') ?? 0, 2),
            ],
            'timeline' => $contents->sortBy('posted_at')->values()
                ->map(fn ($c) => [
                    'date' => $c->posted_at?->toDateString(),
                    'views' => (int) ($c->insights['plays'] ?? $c->insights['views'] ?? 0),
                ])->values(),
            'top' => $sorted->take(3)->values(),
            'underperforming' => $sorted->reverse()->take(3)->values(),
        ]]);
    }

    private function engagementRate(Content $c): float
    {
        $views = (int) ($c->insights['plays'] ?? $c->insights['views'] ?? 0);
        if (! $views) {
            return 0.0;
        }
        $eng = ($c->insights['likes'] ?? 0) + ($c->insights['comments'] ?? 0)
            + ($c->insights['saved'] ?? 0) + ($c->insights['shares'] ?? 0);

        return round(100 * $eng / $views, 2);
    }

    private function accountFor(Request $r): ?InstagramAccount
    {
        $id = $r->get('account_id');
        $q = InstagramAccount::where('creator_id', $r->user()->id);
        if ($id) {
            return $q->findOrFail($id);
        }

        return $q->orderBy('created_at')->first();
    }
}
