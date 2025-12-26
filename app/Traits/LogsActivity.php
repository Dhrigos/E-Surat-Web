<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    public static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('create', 'Created ' . class_basename($model));
        });

        static::updated(function ($model) {
            $model->logActivity('update', 'Updated ' . class_basename($model));
        });

        static::deleted(function ($model) {
            $model->logActivity('delete', 'Deleted ' . class_basename($model));
        });
    }

    public function logActivity($action, $description = null)
    {
        if (Auth::check()) {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'description' => $description ?? "{$action} " . class_basename($this),
                'subject_type' => get_class($this),
                'subject_id' => $this->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }
    }
}
