<?php

namespace App\Listeners;

use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Events\Dispatcher;

class LogAuthenticationActivity
{
    /**
     * Handle user login events.
     */
    public function handleLogin(Login $event): void
    {
        ActivityLogger::logAuth(
            'login',
            "User {$event->user->name} logged in",
            $event->user
        );
    }

    /**
     * Handle user logout events.
     */
    public function handleLogout(Logout $event): void
    {
        ActivityLogger::logAuth(
            'logout',
            "User {$event->user->name} logged out",
            $event->user
        );
    }

    /**
     * Handle failed login attempts.
     */
    public function handleFailed(Failed $event): void
    {
        ActivityLogger::logAuth(
            'failed',
            'Failed login attempt for: '.($event->credentials['email'] ?? 'unknown'),
            $event->user
        );
    }

    /**
     * Handle user registration events.
     */
    public function handleRegistered(Registered $event): void
    {
        ActivityLogger::logAuth(
            'registered',
            "New user registered: {$event->user->name}",
            $event->user
        );
    }

    /**
     * Handle email verification events.
     */
    public function handleVerified(Verified $event): void
    {
        ActivityLogger::logAuth(
            'verified',
            "User {$event->user->name} verified their email",
            $event->user
        );
    }

    /**
     * Handle password reset events.
     */
    public function handlePasswordReset(PasswordReset $event): void
    {
        ActivityLogger::logAuth(
            'password_reset',
            "User {$event->user->name} reset their password",
            $event->user
        );
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleLogin',
            Logout::class => 'handleLogout',
            Failed::class => 'handleFailed',
            Registered::class => 'handleRegistered',
            Verified::class => 'handleVerified',
            PasswordReset::class => 'handlePasswordReset',
        ];
    }
}
