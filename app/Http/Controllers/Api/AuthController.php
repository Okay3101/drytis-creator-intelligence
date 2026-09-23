<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:190|unique:users,email',
            'password' => 'required|string|min:8',
            'account_type' => 'required|in:creator,brand',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'account_type' => $data['account_type'],
            'status' => 'active',
        ]);

        $code = $this->issueOtp($user);

        if (config('app.debug')) {
            Log::info("OTP for {$user->email}: {$code}");
        }

        return response()->json([
            'message' => 'Account created. OTP aapke email par bhej diya gaya hai.',
            'otp_required' => true,
            'email' => $user->email,
        ], 201);
    }

    private function issueOtp(User $user): string
    {
        $code = (string) random_int(100000, 999999);
        $user->forceFill([
            'otp_code_hash' => Hash::make($code),
            'otp_expires_at' => now()->addMinutes((int) env('OTP_TTL_MINUTES', 6)),
            'otp_last_sent_at' => now(),
            'otp_attempts' => 0,
        ])->save();

        // Email via log mailer in dev; notifications table for the record.
        try {
            app(NotificationService::class)->notify($user, 'email', 'otp', "Your Drytis Creator Intelligence OTP is: {$code}");
        } catch (\Throwable $e) {
            Log::warning('OTP notify failed: '.$e->getMessage());
        }

        return $code;
    }

    public function verifyOtp(Request $r)
    {
        $data = $r->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if (! $user->otp_code_hash || $user->otp_expires_at?->isPast()) {
            return response()->json(['message' => 'OTP expire ho gaya. Dobara bhejo.'], 422);
        }
        if (($user->otp_attempts ?? 0) >= (int) env('OTP_MAX_ATTEMPTS', 3)) {
            return response()->json(['message' => 'Bahut zyada attempts. Naya OTP maango.'], 429);
        }
        if (! Hash::check($data['code'], $user->otp_code_hash)) {
            $user->increment('otp_attempts');

            return response()->json(['message' => 'OTP galat hai.'], 422);
        }

        $user->forceFill([
            'otp_code_hash' => null,
            'otp_expires_at' => null,
            'otp_attempts' => 0,
            'email_verified_at' => now(),
        ])->save();

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function resendOtp(Request $r)
    {
        $data = $r->validate(['email' => 'required|email']);
        $user = User::where('email', $data['email'])->firstOrFail();

        if ($user->otp_last_sent_at && $user->otp_last_sent_at->gt(now()->subSeconds(30))) {
            return response()->json(['message' => 'Thoda ruk ke try karo.'], 429);
        }

        $code = $this->issueOtp($user);
        if (config('app.debug')) {
            Log::info("OTP for {$user->email}: {$code}");
        }

        return response()->json(['message' => 'Naya OTP bhej diya gaya hai.']);
    }

    public function login(Request $r)
    {
        $data = $r->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email ya password galat hai.'], 422);
        }
        if (($user->status ?? 'active') === 'suspended') {
            return response()->json(['message' => 'Aapka account suspend kiya gaya hai. Support se contact karo.'], 403);
        }
        if (! $user->email_verified_at) {
            $code = $this->issueOtp($user);
            if (config('app.debug')) {
                Log::info("OTP for {$user->email}: {$code}");
            }

            return response()->json([
                'message' => 'Email verify nahi hua. Naya OTP bhej diya.',
                'otp_required' => true,
                'email' => $user->email,
            ], 403);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function adminLogin(Request $r)
    {
        $data = $r->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->where('is_admin', true)->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid admin credentials.'], 422);
        }

        return response()->json([
            'token' => $user->createToken('admin')->plainTextToken,
            'user' => $user->only('id', 'name', 'email'),
        ]);
    }

    public function forgotPassword(Request $r)
    {
        $data = $r->validate(['email' => 'required|email']);
        $user = User::where('email', $data['email'])->first();

        if ($user) {
            $token = Str::random(48);
            $user->forceFill([
                'password_reset_token' => Hash::make($token),
                'password_reset_expires_at' => now()->addHour(),
            ])->save();
            Log::info("Password reset token for {$user->email}: {$token}");
        }

        return response()->json(['message' => 'Agar email exists karta hai to reset instructions bhej diye.']);
    }

    public function resetPassword(Request $r)
    {
        $data = $r->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if (! $user->password_reset_token || ! $user->password_reset_expires_at?->isFuture()
            || ! Hash::check($data['token'], $user->password_reset_token)) {
            return response()->json(['message' => 'Reset link invalid ya expired hai.'], 422);
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'password_reset_token' => null,
            'password_reset_expires_at' => null,
        ])->save();
        $user->tokens()->delete();

        return response()->json(['message' => 'Password badal diya. Ab log in karo.']);
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $r)
    {
        return response()->json(['user' => $this->userPayload($r->user())]);
    }

    public function deleteAccount(Request $r)
    {
        $user = $r->user();
        $user->tokens()->delete();
        dispatch(new \App\Jobs\ProcessAccountDeletion($user));

        return response()->json(['message' => 'Account deletion schedule ho gaya.']);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'account_type' => $user->account_type,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'creator_profile' => $user->creatorProfile ? [
                'niche' => $user->creatorProfile->niche,
                'follower_count' => $user->creatorProfile->follower_count,
                'content_goal' => $user->creatorProfile->content_goal,
                'posting_frequency' => $user->creatorProfile->posting_frequency,
                'language' => $user->creatorProfile->language,
            ] : null,
        ];
    }
}
