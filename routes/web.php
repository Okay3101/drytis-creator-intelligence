<?php

use Illuminate\Support\Facades\Route;

// SPA entrypoints — the built React apps live in public/ and public/admin/.
// Caddy serves static files directly; these routes catch history-mode paths.
Route::get('/{any}', function () {
    return file_exists(public_path('index.html'))
        ? response()->file(public_path('index.html'), ['Cache-Control' => 'no-cache'])
        : abort(404);
})->where('any', '^(?!api|admin|m|storage|build|up).*$');

Route::get('/admin', function () {
    return file_exists(public_path('admin/index.html'))
        ? response()->file(public_path('admin/index.html'), ['Cache-Control' => 'no-cache'])
        : abort(404);
});

Route::get('/admin/{any}', function () {
    return file_exists(public_path('admin/index.html'))
        ? response()->file(public_path('admin/index.html'), ['Cache-Control' => 'no-cache'])
        : abort(404);
})->where('any', '.*');

// Mobile app SPA (frontend-mobile build -> public/m/) — history-mode catch-all.
Route::get('/m', function () {
    return file_exists(public_path('m/index.html'))
        ? response()->file(public_path('m/index.html'), ['Cache-Control' => 'no-cache'])
        : abort(404);
});
Route::get('/m/{any}', function () {
    return file_exists(public_path('m/index.html'))
        ? response()->file(public_path('m/index.html'), ['Cache-Control' => 'no-cache'])
        : abort(404);
})->where('any', '.*');
