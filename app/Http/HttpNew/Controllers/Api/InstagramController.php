<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SyncAndAnalyzeAccount;
use App\Models\Analysis;
use App\Models\InstagramAccount;
use App\Models\WinningPattern;
use App\Services\Instagram\InstagramAccountService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InstagramController extends Controller
{
    public function accounts(Request $r)
    {
        $accounts = InstagramAccount::where('creator_id', $r->user()->id)
            ->orderBy('created_at')
            ->get(['id', 'username', 'ig_account_type', 'connection_status', 'last_synced_at'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'username' => $a->username,
                'ig_account_type' => $a->ig_account_type,
                'connection_status' => $a->connection_status,
                'is_demo' => Str::startsWith($a->ig_user_id, 'demo-'),
                'last_synced_at' => $a->last_synced_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $accounts]);
    }

    public function startConnect(Request $r)
    {
        $provider = InstagramAccountService::provider();
        $state = Str::random(24);
        $r->session() && session(['ig_oauth_state' => $state]);

        return response()->json([
            'mode' => $provider->isDemo() ? 'demo' : 'live',
            'authorization_url' => $provider->authorizationUrl($state),
            'state' => $state,
        ]);
    }

    public function connectDemo(Request $r)
    {
        $data = $r->validate(['username' => 'required|string|min:2|max:60|regex:/^[A-Za-z0-9._]+$/']);
        $provider = InstagramAccountService::provider();
        if (! $provider->isDemo()) {
            return response()->json(['message' => 'Demo connect sirf demo mode mein available hai.'], 422);
        }

        $exists = InstagramAccount::where('creator_id', $r->user()->id)
            ->where('username', $data['username'])->exists();
        if ($exists) {
            return response()->json(['message' => 'Ye account pehle se connected hai.'], 422);
        }

        $account = app(InstagramAccountService::class)->connectFromDemo($data['username'], $r->user());
        SyncAndAnalyzeAccount::dispatch($account, 'initial');

        return response()->json([
            'message' => 'Demo account connect ho gaya. Analysis chal raha hai — kuch second mein ready.',
            'data' => ['id' => $account->id, 'username' => $account->username],
        ], 201);
    }

    public function callback(Request $r)
    {
        if ($r->filled('demo')) {
            return response()->json(['message' => 'Demo mode — /api/instagram/connect-demo use karo.']);
        }

        $data = $r->validate(['code' => 'required|string', 'state' => 'nullable|string']);
        $result = app(InstagramAccountService::class)->connectFromCode($data['code'], $r->user());

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error'], 'message' => $result['message']], 422);
        }

        SyncAndAnalyzeAccount::dispatch($result['account'], 'initial');

        return response()->json([
            'message' => 'Instagram connect ho gaya. Analysis chal raha hai.',
            'data' => ['id' => $result['account']->id, 'username' => $result['account']->username],
        ]);
    }

    public function disconnect(Request $r, string $id)
    {
        $account = InstagramAccount::where('creator_id', $r->user()->id)->findOrFail($id);
        $account->delete();

        return response()->json(['message' => 'Account disconnect ho gaya.']);
    }

    public function sync(Request $r, string $id)
    {
        $account = InstagramAccount::where('creator_id', $r->user()->id)->findOrFail($id);

        if ($account->last_synced_at && $account->last_synced_at->gt(now()->subMinutes(5))) {
            return response()->json(['message' => 'Abhi abhi sync hua hai — thodi der baad try karo.'], 429);
        }

        SyncAndAnalyzeAccount::dispatch($account, $account->contents()->exists() ? 'refresh' : 'initial');

        return response()->json(['message' => 'Sync shuru ho gaya — jab ready hoga notification milega.']);
    }

    public function analysisStatus(Request $r, string $id)
    {
        $account = InstagramAccount::where('creator_id', $r->user()->id)->findOrFail($id);
        $analysis = Analysis::where('instagram_account_id', $account->id)
            ->orderByDesc('created_at')->first();

        $reelCount = $account->contents()->where('media_type', 'REEL')->count();

        return response()->json([
            'data' => [
                'reels_count' => $reelCount,
                'minimum_required' => 5,
                'last_synced_at' => $account->last_synced_at?->toIso8601String(),
                'analysis' => $analysis ? [
                    'status' => $analysis->status,
                    'type' => $analysis->type,
                    'confidence' => $analysis->confidence,
                    'data_coverage' => $analysis->data_coverage,
                    'blocked_message' => $analysis->results['message'] ?? null,
                    'error' => $analysis->error,
                    'updated_at' => $analysis->updated_at?->toIso8601String(),
                ] : null,
            ],
        ]);
    }

    public function diagnosis(Request $r, string $id)
    {
        $account = InstagramAccount::where('creator_id', $r->user()->id)->findOrFail($id);
        $diagnosis = $account->latestDiagnosis()->first();

        if (! $diagnosis) {
            $reelCount = $account->contents()->where('media_type', 'REEL')->count();
            $latest = Analysis::where('instagram_account_id', $account->id)->orderByDesc('created_at')->first();

            if ($latest && $latest->status === 'completed' && ($latest->results['blocked'] ?? null) === 'minimum_reels') {
                return response()->json([
                    'blocked' => 'minimum_reels',
                    'message' => $latest->results['message'],
                ]);
            }
            if ($latest && in_array($latest->status, ['pending', 'running'])) {
                return response()->json(['pending' => true, 'message' => 'Analysis chal raha hai — thodi der mein ready.']);
            }

            return response()->json(['empty' => true, 'message' => 'Pehle Instagram account connect karo ya sync chalao.']);
        }

        $patterns = WinningPattern::where('instagram_account_id', $account->id)
            ->orderByDesc('created_at')->get()
            ->map(fn ($p) => [
                'category' => $p->category,
                'title' => $p->pattern['title'] ?? 'Pattern',
                'pattern' => $p->pattern['pattern'] ?? [],
                'evidence' => $p->evidence['detail'] ?? null,
                'confidence' => $p->confidence,
            ]);

        return response()->json([
            'data' => [
                'content_health' => $diagnosis->content_health,
                'top_problems' => collect($diagnosis->recommendations)->map(fn ($rec) => [
                    'key' => $rec['key'],
                    'label' => $rec['label'],
                    'problem' => collect($diagnosis->problems)->firstWhere('key', $rec['key'])['problem'] ?? null,
                    'evidence' => $diagnosis->evidence[$rec['key']] ?? null,
                    'fix' => $rec['fix'],
                ])->values(),
                'secondary' => $diagnosis->problems ? collect($diagnosis->problems)->slice(3)->values() : [],
                'strengths' => $diagnosis->strengths,
                'winning_patterns' => $patterns,
                'helpful_feedback' => $diagnosis->helpful_feedback,
                'updated_at' => $diagnosis->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function feedback(Request $r, string $id)
    {
        $data = $r->validate(['helpful' => 'required|boolean']);
        $account = InstagramAccount::where('creator_id', $r->user()->id)->findOrFail($id);
        $diagnosis = $account->latestDiagnosis()->firstOrFail();
        $diagnosis->update(['helpful_feedback' => $data['helpful'] ? 'yes' : 'no']);

        return response()->json(['message' => 'Thanks! Feedback save ho gaya.']);
    }

    public function homePriority(Request $r)
    {
        $user = $r->user();
        $account = InstagramAccount::where('creator_id', $user->id)->orderBy('created_at')->first();

        if (! $account) {
            return response()->json(['data' => [
                'title' => 'Instagram account connect karo',
                'why' => 'Bina account ke hum aapka content diagnose nahi kar sakte. Sirf 30 second lagta hai.',
                'action' => 'Connect Instagram',
                'target' => 'connect',
            ]]);
        }

        $analysis = Analysis::where('instagram_account_id', $account->id)->orderByDesc('created_at')->first();
        if ($analysis && in_array($analysis->status, ['pending', 'running'])) {
            return response()->json(['data' => [
                'title' => 'Analysis chal raha hai',
                'why' => 'Hum aapki reels analyze kar rahe hain. Ready hote hi notification milega.',
                'action' => 'Diagnose kholo',
                'target' => 'diagnose',
            ]]);
        }

        $diagnosis = $account->latestDiagnosis()->first();
        if (! $diagnosis) {
            return response()->json(['data' => [
                'title' => 'Pehla diagnosis chalao',
                'why' => 'Aapki reels ka poora analysis — kya strong hai, kya fix karna hai.',
                'action' => 'Diagnose kholo',
                'target' => 'diagnose',
            ]]);
        }

        $topKey = $diagnosis->top_problem_keys[0] ?? null;
        $top = $topKey ? collect($diagnosis->problems)->firstWhere('key', $topKey) : null;

        if (! $top) {
            return response()->json(['data' => [
                'title' => 'Sab strong lag raha hai — create karo',
                'why' => 'Koi bada problem nahi mila. Naya script banao aur streak maintain karo.',
                'action' => 'Script banao',
                'target' => 'create',
            ]]);
        }

        return response()->json(['data' => [
            'title' => $top['fix'] ?? $top['label'],
            'why' => $top['problem'] ?? null,
            'action' => $top['label'],
            'target' => 'diagnose',
            'problem_key' => $topKey,
        ]]);
    }
}
