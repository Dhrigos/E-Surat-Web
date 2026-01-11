<?php

namespace App\Providers;

use App\Listeners\LogAuthenticationActivity;
use App\Models\Conversation;
use App\Models\Disposition;
use App\Models\Jabatan;
// Models to observe
use App\Models\Letter;
use App\Models\Message;
use App\Models\User;
use App\Observers\ModelActivityObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('local') || $this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Register model observers for automatic activity logging
        $this->registerModelObservers();

        // Register authentication event listeners
        $this->registerAuthenticationListeners();
    }

    /**
     * Register model observers
     */
    protected function registerModelObservers(): void
    {
        // Observe important models for automatic logging
        // Note: Letter model already uses LogsActivity trait, so we skip it here
        User::observe(ModelActivityObserver::class);
        Disposition::observe(ModelActivityObserver::class);
        Jabatan::observe(ModelActivityObserver::class);
        Message::observe(ModelActivityObserver::class);
        Conversation::observe(ModelActivityObserver::class);
    }

    /**
     * Register authentication event listeners
     */
    protected function registerAuthenticationListeners(): void
    {
        Event::subscribe(LogAuthenticationActivity::class);
    }
}
