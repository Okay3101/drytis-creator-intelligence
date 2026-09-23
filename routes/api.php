<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InstagramController;
use App\Http\Controllers\Api\SupportController;
use Illuminate\Support\Facades\Route;

require __DIR__.'/admin-api.php';

// Public auth
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// Public-safe platform settings
Route::get('settings', [AccountController::class, 'settings']);

// Admin SPA login (public)
use App\Http\Controllers\Api\AuthController as ApiAuthController;
Route::post('admin/login', [ApiAuthController::class, 'adminLogin']);

// Instagram + intelligence (creator)
Route::middleware(['auth:sanctum', 'account.active'])->prefix('instagram')->group(function () {
    Route::get('accounts', [InstagramController::class, 'accounts']);
    Route::get('connect', [InstagramController::class, 'startConnect']);
    Route::post('connect-demo', [InstagramController::class, 'connectDemo']);
    Route::post('callback', [InstagramController::class, 'callback']);
    Route::delete('accounts/{id}', [InstagramController::class, 'disconnect']);
    Route::post('accounts/{id}/sync', [InstagramController::class, 'sync']);
    Route::get('accounts/{id}/analysis-status', [InstagramController::class, 'analysisStatus']);
    Route::get('accounts/{id}/diagnosis', [InstagramController::class, 'diagnosis']);
    Route::post('accounts/{id}/feedback', [InstagramController::class, 'feedback']);
});
Route::get('home/priority', [InstagramController::class, 'homePriority'])
    ->middleware(['auth:sanctum', 'account.active']);

// Reel Readiness (pre-publish fix loop)
Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
    Route::post('readiness/upload', [App\Http\Controllers\Api\ReadinessController::class, 'uploadMedia']);
    Route::post('readiness', [App\Http\Controllers\Api\ReadinessController::class, 'submit']);
    Route::get('readiness', [App\Http\Controllers\Api\ReadinessController::class, 'history']);
    Route::get('readiness/{id}', [App\Http\Controllers\Api\ReadinessController::class, 'show']);
});

// AI Script Generator
Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
    Route::post('scripts/generate', [App\Http\Controllers\Api\ScriptController::class, 'generate']);
    Route::post('scripts/{id}/revise', [App\Http\Controllers\Api\ScriptController::class, 'revise']);
    Route::get('scripts', [App\Http\Controllers\Api\ScriptController::class, 'history']);
    Route::get('scripts/{id}', [App\Http\Controllers\Api\ScriptController::class, 'show']);
});

// Analytics ("what happened")
Route::get('analytics/overview', [App\Http\Controllers\Api\AnalyticsController::class, 'overview'])
    ->middleware(['auth:sanctum', 'account.active']);

// Authenticated (creator/brand)
Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
    Route::put('profile', [AccountController::class, 'profile']);
    Route::put('password', [AccountController::class, 'updatePassword']);
    Route::put('notification-prefs', [AccountController::class, 'notificationPrefs']);
    Route::post('push-tokens', [AccountController::class, 'registerPushToken']);
    Route::get('notifications', [AccountController::class, 'notifications']);
    Route::post('notifications/read', [AccountController::class, 'markNotificationsRead']);
    Route::delete('account', [AuthController::class, 'deleteAccount']);

    // Support (separate from campaign chat)
    Route::get('support', [SupportController::class, 'myConversation']);
    Route::post('support/messages', [SupportController::class, 'sendMessage']);
});
