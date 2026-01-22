<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Letter;
use App\Models\LetterRecipient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MailDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // 1. Statistics
        $totalSent = Letter::where('created_by', $user->id)->count();
        
        $totalInbox = LetterRecipient::where('recipient_type', 'user')
            ->where('recipient_id', $user->id)
            ->count();

        // Pending Approvals (where user is the current approver)
        // We check for LetterApprover records assigned to the user with 'pending' status.
        // We also ensure the letter itself is still pending (not cancelled/rejected by others in parallel).
        $pendingApprovals = \App\Models\LetterApprover::where('user_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('letter', function($q) {
                $q->where('status', 'pending');
            })
            ->count();

        // 2. Charts Data
        // Letters per month (Sent)
        // Letters per month (Sent)
        // Use SQLite compatible date extraction for testing, or check driver
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'sqlite') {
            $lettersPerMonth = Letter::selectRaw('strftime("%m", created_at) as month, COUNT(*) as count')
                ->where('created_by', $user->id)
                ->whereRaw('strftime("%Y", created_at) = ?', [date('Y')])
                ->groupBy('month')
                ->orderBy('month')
                ->get();
        } else {
            $lettersPerMonth = Letter::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->where('created_by', $user->id)
                ->whereYear('created_at', date('Y'))
                ->groupBy('month')
                ->orderBy('month')
                ->get();
        }

        $lettersPerMonth = $lettersPerMonth->map(function ($item) {
                return [
                    'name' => date('M', mktime(0, 0, 0, (int)$item->month, 10)),
                    'total' => $item->count
                ];
            });

        // 3. Recent Activity
        $activities = ActivityLog::with('user')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // 4. User Distribution by Province
        // Combine data from both user_member and user_calon tables
        $usersByProvince = DB::table('indonesia_provinces')
            ->leftJoin(DB::raw('(
                SELECT province_id, COUNT(*) as total 
                FROM (
                    SELECT province_id FROM user_member WHERE province_id IS NOT NULL
                    UNION ALL
                    SELECT province_id FROM user_calon WHERE province_id IS NOT NULL
                ) as combined_users
                GROUP BY province_id
            ) as user_counts'), 'indonesia_provinces.id', '=', 'user_counts.province_id')
            ->select(
                'indonesia_provinces.id as province_id',
                'indonesia_provinces.name as province', 
                DB::raw('COALESCE(user_counts.total, 0) as total')
            )
            ->where('user_counts.total', '>', 0)
            ->orWhereNotNull('user_counts.province_id')
            ->groupBy('indonesia_provinces.id', 'indonesia_provinces.name', 'user_counts.total')
            ->get()
            ->map(function($item) {
                return [
                    'province_code' => (string)$item->province_id, // Use ID as code for GeoJSON matching
                    'province' => $item->province,
                    'total' => (int)$item->total,
                ];
            });

        $totalUsers = User::count();

        $adminStats = null;
        if ($user->hasRole(['admin', 'super-admin'])) {
            $globalTotalLetters = Letter::count(); 
            $totalUnits = \App\Models\Jabatan::selectRaw(
                'COUNT(DISTINCT nama) - SUM(level = 1) as total'
            )->value('total');
            // Mock Uptime or fetch
            $uptime = '99.9%'; 
            
            // Top Senders
            $topSenders = Letter::select('created_by', DB::raw('count(*) as total'))
                ->groupBy('created_by')
                ->orderByDesc('total')
                ->limit(5)
                ->with('creator:id,name,profile')
                ->get()
                ->map(function($item) {
                    return [
                        'name' => $item->creator->name ?? 'Unknown',
                        'avatar' => $item->creator->avatar ?? null,
                        'total' => $item->total
                    ];
                });

            // Global Status Breakdown
            $globalStatus = Letter::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get()
                ->pluck('total', 'status');

            $adminStats = [
                'totalLetters' => $globalTotalLetters,
                'totalUnits' => $totalUnits,
                'topSenders' => $topSenders,
                'status' => [
                    'approved' => $globalStatus['approved'] ?? 0,
                    'rejected' => $globalStatus['rejected'] ?? 0,
                    'pending' => $globalStatus['pending'] ?? 0,
                    'draft' => $globalStatus['draft'] ?? 0,
                ],
                'performance' => [
                    'approvalRate' => $globalTotalLetters > 0 ? round(($globalStatus['approved'] ?? 0) / $globalTotalLetters * 100, 1) : 0,
                ]
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'sent' => $totalSent,
                'inbox' => $totalInbox,
                'pending' => $pendingApprovals,
            ],
            'chartData' => $lettersPerMonth,
            'activities' => $activities,
            'usersByProvince' => $usersByProvince,
            'totalUsers' => $totalUsers,
            'adminStats' => $adminStats, // New prop
        ]);
    }
}
