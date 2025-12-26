<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $action = $request->input('action');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = ActivityLog::with('user')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($action) {
            $query->where('action', $action);
        }

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $logs = $query->paginate(20)->withQueryString();

        // Get unique actions for filter dropdown
        $actions = ActivityLog::select('action')->distinct()->pluck('action');

        return Inertia::render('AuditLog/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'action', 'start_date', 'end_date']),
            'actions' => $actions,
        ]);
    }
}
