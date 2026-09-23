<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(\App\Services\Instagram\InstagramProvider::class, function () {
            return config('instagram.mode') === 'demo'
                ? new \App\Services\Instagram\DemoInstagramProvider()
                : new \App\Services\Instagram\GraphApiClient(
                    config('instagram.graph_base'),
                    (string) config('instagram.app_id'),
                    (string) config('instagram.app_secret'),
                    (string) config('instagram.redirect_uri'),
                );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
