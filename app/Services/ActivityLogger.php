<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;

class ActivityLogger
{
    protected static ?string $batchUuid = null;

    /**
     * Log an activity
     */
    public static function log(
        string $action,
        string $description,
        $subject = null,
        array $properties = [],
        ?string $event = null,
        $causer = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => Auth::id(),
            'causer_type' => $causer ? get_class($causer) : (Auth::user() ? get_class(Auth::user()) : null),
            'causer_id' => $causer ? $causer->id : Auth::id(),
            'action' => $action,
            'event' => $event,
            'description' => $description,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject ? $subject->id : null,
            'properties' => $properties,
            'batch_uuid' => static::$batchUuid,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Log model created event
     */
    public static function logCreated(Model $model, ?string $description = null): ActivityLog
    {
        return static::log(
            action: 'model.created',
            description: $description ?? class_basename($model).' created',
            subject: $model,
            properties: ['attributes' => $model->getAttributes()],
            event: 'created'
        );
    }

    /**
     * Log model updated event
     */
    public static function logUpdated(Model $model, ?string $description = null): ActivityLog
    {
        $changes = $model->getChanges();
        $original = array_intersect_key($model->getOriginal(), $changes);

        return static::log(
            action: 'model.updated',
            description: $description ?? class_basename($model).' updated',
            subject: $model,
            properties: [
                'attributes' => $changes,
                'old' => $original,
            ],
            event: 'updated'
        );
    }

    /**
     * Log model deleted event
     */
    public static function logDeleted(Model $model, ?string $description = null): ActivityLog
    {
        return static::log(
            action: 'model.deleted',
            description: $description ?? class_basename($model).' deleted',
            subject: $model,
            properties: ['attributes' => $model->getAttributes()],
            event: 'deleted'
        );
    }

    /**
     * Log authentication event
     */
    public static function logAuth(string $event, string $description, ?Model $user = null): ActivityLog
    {
        return static::log(
            action: "auth.{$event}",
            description: $description,
            subject: $user,
            event: $event
        );
    }

    /**
     * Log file operation
     */
    public static function logFile(string $operation, string $filename, ?Model $subject = null): ActivityLog
    {
        return static::log(
            action: "file.{$operation}",
            description: "File {$operation}: {$filename}",
            subject: $subject,
            properties: ['filename' => $filename],
            event: $operation
        );
    }

    /**
     * Log system event
     */
    public static function logSystem(string $event, string $description, array $properties = []): ActivityLog
    {
        return static::log(
            action: "system.{$event}",
            description: $description,
            properties: $properties,
            event: $event
        );
    }

    /**
     * Start a batch of activities
     */
    public static function startBatch(): string
    {
        static::$batchUuid = (string) Str::uuid();

        return static::$batchUuid;
    }

    /**
     * End the current batch
     */
    public static function endBatch(): void
    {
        static::$batchUuid = null;
    }

    /**
     * Execute a callback within a batch
     */
    public static function batch(callable $callback): string
    {
        $batchUuid = static::startBatch();

        try {
            $callback();
        } finally {
            static::endBatch();
        }

        return $batchUuid;
    }

    /**
     * Get current batch UUID
     */
    public static function getCurrentBatch(): ?string
    {
        return static::$batchUuid;
    }
}
