<?php

namespace App\Http\Controllers;

use App\Models\LetterApprover;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalTrackingController extends Controller
{
    public function index(Request $request)
    {
        // Only super admin can access
        if (! auth()->user()->hasRole('super-admin')) {
            abort(403);
        }

        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());
        $adminFilter = $request->input('admin_id');
        $actionFilter = $request->input('action');

        // User Verification Statistics
        $verifiedUsersQuery = User::whereNotNull('verified_at')
            ->whereBetween('verified_at', [$startDate, $endDate]);

        if ($adminFilter) {
            $verifiedUsersQuery->where('verified_by', $adminFilter);
        }

        if ($actionFilter) {
            if ($actionFilter === 'rejected') {
                $verifiedUsersQuery->whereNotNull('rejection_reason');
            } elseif ($actionFilter === 'approved') {
                $verifiedUsersQuery->whereNull('rejection_reason');
            }
        }

        $totalVerifications = $verifiedUsersQuery->count();

        // Calculate average verification time (duration in seconds)
        // We divide by 3600 to report it in hours, or we could change frontend to min/sec
        // Let's stick to hours for now as requested?
        // Actually admins might be fast, so minutes is better, but let's see.
        // Calculate average verification time
        // Use COALESCE to fallback to (verified_at - created_at) if verification_duration is null
        $avgVerificationTimeQuery = User::whereNotNull('verified_at')
            ->whereBetween('verified_at', [$startDate, $endDate]);

        if ($actionFilter) {
             if ($actionFilter === 'rejected') {
                $avgVerificationTimeQuery->whereNotNull('rejection_reason');
            } elseif ($actionFilter === 'approved') {
                $avgVerificationTimeQuery->whereNull('rejection_reason');
            }
        }
        
        if ($adminFilter) {
            $avgVerificationTimeQuery->where('verified_by', $adminFilter);
        }

        $avgSeconds = $avgVerificationTimeQuery
            ->selectRaw('AVG(COALESCE(verification_duration, TIMESTAMPDIFF(SECOND, created_at, verified_at))) as avg_val')
            ->value('avg_val');
        
        $avgSeconds = $avgSeconds ? (float) $avgSeconds : 0;

        // Calculate counts for Approved vs Rejected
        $approvedQuery = User::whereNotNull('verified_at')
            ->whereBetween('verified_at', [$startDate, $endDate])
            ->whereNull('rejection_reason');
        
        $rejectedQuery = User::whereNotNull('verified_at')
            ->whereBetween('verified_at', [$startDate, $endDate])
            ->whereNotNull('rejection_reason');

        if ($adminFilter) {
            $approvedQuery->where('verified_by', $adminFilter);
            $rejectedQuery->where('verified_by', $adminFilter);
        }

        $totalApproved = $approvedQuery->count();
        $totalRejected = $rejectedQuery->count();

        // Recent Verifications
        $recentVerifications = User::with(['verifier:id,name', 'detail'])
            ->whereNotNull('verified_at')
            ->whereBetween('verified_at', [$startDate, $endDate])
            ->when($adminFilter, fn ($q) => $q->where('verified_by', $adminFilter))
            ->when($actionFilter, function ($q) use ($actionFilter) {
                if ($actionFilter === 'rejected') {
                    $q->whereNotNull('rejection_reason');
                } elseif ($actionFilter === 'approved') {
                    $q->whereNull('rejection_reason');
                }
            })
            ->orderBy('verified_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nia_nrp' => $user->detail?->nia_nrp ?? $user->detail?->nomor_anggota,
                'verified_at' => $user->verified_at,
                'verified_by_name' => $user->verifier?->name,
                'status' => $user->rejection_reason ? 'rejected' : 'approved',
                'time_taken_hours' => $user->verification_duration ? ($user->verification_duration / 3600) : 0,
            ]);

        // Get list of admins for filter
        $admins = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['super-admin', 'admin']))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Ensure dates are strings for frontend
        $startDateStr = $startDate instanceof \Carbon\Carbon ? $startDate->format('Y-m-d') : $startDate;
        $endDateStr = $endDate instanceof \Carbon\Carbon ? $endDate->format('Y-m-d') : $endDate;
        // If they came as strings but not formatted? ensure they are Y-m-d
        if (is_string($startDateStr) && strlen($startDateStr) > 10) {
             $startDateStr = substr($startDateStr, 0, 10);
        }
         if (is_string($endDateStr) && strlen($endDateStr) > 10) {
             $endDateStr = substr($endDateStr, 0, 10);
        }


        return Inertia::render('ApprovalTracking/Index', [
            'statistics' => [
                'total_verifications' => $totalVerifications,
                'total_approved' => $totalApproved,
                'total_rejected' => $totalRejected,
                'avg_verification_time_seconds' => $avgSeconds,
            ],
            'recent_verifications' => $recentVerifications,
            'recent_letter_approvals' => [], // Empty array as requested
            'admins' => $admins,
            'filters' => [
                'start_date' => $startDateStr,
                'end_date' => $endDateStr,
                'admin_id' => $adminFilter,
                'action' => $actionFilter,
            ],
        ]);
    }
}
