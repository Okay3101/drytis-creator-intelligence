<?php

namespace App\Http\Middleware2;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures the authenticated user has one of the allowed account types.
 * Usage: ->middleware('account.type:creator') or 'account.type:creator,brand'
 */
class EnsureAccountType
{
    public function handle(Request $request, Closure $next, string ...$types): Response
    {
        $user = $request->user();

        if (! $user || ($types !== [] && ! in_array($user->account_type, $types, true))) {
            return response()->json(['message' => 'This area is not available for your account type.'], 403);
        }

        return $next($request);
    }
}
