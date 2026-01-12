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

        $totalVerifications = $verifiedUsersQuery->count();

        // Calculate average verification time (duration in seconds)
        // We divide by 3600 to report it in hours, or we could change frontend to min/sec
        // Let's stick to hours for now as requested?
        // Actually admins might be fast, so minutes is better, but let's see.
        // The implementation plan says "Update $avgVerificationTime".
        $avgVerificationTime = User::whereNotNull('verification_duration')
            ->whereBetween('verified_at', [$startDate, $endDate])
            ->avg('verification_duration');

        // Convert seconds to hours for compatibility with existing frontend or key expectation
        $avgVerificationTime = $avgVerificationTime ? ($avgVerificationTime / 3600) : 0;

        // Recent Verifications
        $recentVerifications = User::with(['verifier:id,name', 'detail:user_id,nia_nrp'])
            ->whereNotNull('verified_at')
            ->whereBetween('verified_at', [$startDate, $endDate])
            ->when($adminFilter, fn ($q) => $q->where('verified_by', $adminFilter))
            ->orderBy('verified_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nia_nrp' => $user->detail?->nia_nrp,
                'verified_at' => $user->verified_at,
                'verified_by_name' => $user->verifier?->name,
                'status' => $user->rejection_reason ? 'rejected' : 'approved',
                'time_taken_hours' => $user->verification_duration ? ($user->verification_duration / 3600) : 0,
            ]);

        // Letter Approval Statistics
        $letterApprovalsQuery = LetterApprover::whereNotNull('approved_at')
            ->whereBetween('approved_at', [$startDate, $endDate]);

        if ($adminFilter) {
            $letterApprovalsQuery->where('user_id', $adminFilter);
        }

        if ($actionFilter) {
            $letterApprovalsQuery->where('status', $actionFilter);
        }

        $totalLetterApprovals = $letterApprovalsQuery->count();

        // Calculate average letter approval time (from letter created to approved)
        $avgLetterApprovalTime = LetterApprover::whereNotNull('approved_at')
            ->whereBetween('approved_at', [$startDate, $endDate])
            ->join('letters', 'letter_approvers.letter_id', '=', 'letters.id')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, letters.created_at, letter_approvers.approved_at)) as avg_hours')
            ->value('avg_hours');

        // Recent Letter Approvals
        $recentLetterApprovals = LetterApprover::with(['letter:id,subject,created_at', 'user:id,name'])
            ->whereNotNull('approved_at')
            ->whereBetween('approved_at', [$startDate, $endDate])
            ->when($adminFilter, fn ($q) => $q->where('user_id', $adminFilter))
            ->when($actionFilter, fn ($q) => $q->where('status', $actionFilter))
            ->orderBy('approved_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn ($approver) => [
                'id' => $approver->id,
                'letter_subject' => $approver->letter?->subject,
                'approver_name' => $approver->user?->name,
                'status' => $approver->status,
                'approved_at' => $approver->approved_at,
                'remarks' => $approver->remarks,
                'time_taken_hours' => $approver->letter?->created_at->diffInHours($approver->approved_at),
            ]);

        // Get list of admins for filter
        $admins = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['super-admin', 'admin']))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('ApprovalTracking/Index', [
            'statistics' => [
                'total_verifications' => $totalVerifications,
                'avg_verification_time_hours' => round($avgVerificationTime ?? 0, 1),
                'total_letter_approvals' => $totalLetterApprovals,
                'avg_letter_approval_time_hours' => round($avgLetterApprovalTime ?? 0, 1),
            ],
            'recent_verifications' => $recentVerifications,
            'recent_letter_approvals' => $recentLetterApprovals,
            'admins' => $admins,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'admin_id' => $adminFilter,
                'action' => $actionFilter,
            ],
        ]);
    }
}
