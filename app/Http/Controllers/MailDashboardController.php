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
        $usersByProvince = DB::table('user_details')
            ->join('indonesia_provinces', 'user_details.province_id', '=', 'indonesia_provinces.id')
            ->select(
                'indonesia_provinces.id as province_id',
                'indonesia_provinces.name as province', 
                DB::raw('count(user_details.user_id) as total')
            )
            ->whereNotNull('user_details.province_id')
            ->groupBy('indonesia_provinces.id', 'indonesia_provinces.name')
            ->get()
            ->map(function($item) {
                return [
                    'province_code' => (string)$item->province_id, // Use ID as code for GeoJSON matching
                    'province' => $item->province,
                    'total' => $item->total,
                ];
            });

        $totalUsers = User::count();

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
        ]);
    }
}
