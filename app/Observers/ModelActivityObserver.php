<?php

namespace App\Observers;

use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Model;

class ModelActivityObserver
{
    /**
     * Handle the model "created" event.
     */
    public function created(Model $model): void
    {
        // Skip logging for ActivityLog itself to prevent infinite loop
        if ($model instanceof \App\Models\ActivityLog) {
            return;
        }

        ActivityLogger::logCreated($model);
    }

    /**
     * Handle the model "updated" event.
     */
    public function updated(Model $model): void
    {
        // Skip logging for ActivityLog itself
        if ($model instanceof \App\Models\ActivityLog) {
            return;
        }

        // Only log if there are actual changes
        if ($model->wasChanged()) {
            ActivityLogger::logUpdated($model);
        }
    }

    /**
     * Handle the model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        // Skip logging for ActivityLog itself
        if ($model instanceof \App\Models\ActivityLog) {
            return;
        }

        ActivityLogger::logDeleted($model);
    }

    /**
     * Handle the model "restored" event.
     */
    public function restored(Model $model): void
    {
        // Skip logging for ActivityLog itself
        if ($model instanceof \App\Models\ActivityLog) {
            return;
        }

        ActivityLogger::log(
            action: 'model.restored',
            description: class_basename($model).' restored',
            subject: $model,
            properties: ['attributes' => $model->getAttributes()],
            event: 'restored'
        );
    }
}
