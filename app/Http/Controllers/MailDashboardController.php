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
            // Data for user_calon only
            $usersByProvince = DB::table('indonesia_provinces')
                ->leftJoin(DB::raw('(
                    SELECT province_id, COUNT(*) as total 
                    FROM user_calon 
                    WHERE province_id IS NOT NULL
                    GROUP BY province_id
                ) as user_counts'), 'indonesia_provinces.id', '=', 'user_counts.province_id')
                ->select(
                    'indonesia_provinces.id as province_id',
                    'indonesia_provinces.name as province', 
                    DB::raw('COALESCE(user_counts.total, 0) as total')
                )
                ->where('user_counts.total', '>', 0)
                ->groupBy('indonesia_provinces.id', 'indonesia_provinces.name', 'user_counts.total')
                ->get()
                ->map(function($item) {
                    return [
                    'province_code' => (string)$item->province_id, // Use ID as code for GeoJSON matching
                        'province' => $item->province,
                        'total' => (int)$item->total,
                    ];
                });
        // $usersByProvince = DB::table('indonesia_provinces')
        //     ->leftJoin(DB::raw('(
        //         SELECT province_id, COUNT(*) as total 
        //         FROM (
        //             SELECT province_id FROM user_member WHERE province_id IS NOT NULL
        //             UNION ALL
        //             SELECT province_id FROM user_calon WHERE province_id IS NOT NULL
        //         ) as combined_users
        //         GROUP BY province_id
        //     ) as user_counts'), 'indonesia_provinces.id', '=', 'user_counts.province_id')
        //     ->select(
        //         'indonesia_provinces.id as province_id',
        //         'indonesia_provinces.name as province', 
        //         DB::raw('COALESCE(user_counts.total, 0) as total')
        //     )
        //     ->where('user_counts.total', '>', 0)
        //     ->orWhereNotNull('user_counts.province_id')
        //     ->groupBy('indonesia_provinces.id', 'indonesia_provinces.name', 'user_counts.total')
        //     ->get()
        //     ->map(function($item) {
        //         return [
        //             'province_code' => (string)$item->province_id, // Use ID as code for GeoJSON matching
        //             'province' => $item->province,
        //             'total' => (int)$item->total,
        //         ];
        //     });

        $totalUsers = User::where('member_type', 'calon_anggota')->count();

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

        $matraCounts = [
            'AD' => 0,
            'AL' => 0,
            'AU' => 0,
        ];

        $matraCounts = [
            'AD' => \App\Models\UserCalon::where('matra', 'AD')->count(),
            'AL' => \App\Models\UserCalon::where('matra', 'AL')->count(),
            'AU' => \App\Models\UserCalon::where('matra', 'AU')->count(),
        ];

        // Assuming $isCalonDashboard is determined elsewhere, or we can infer it from the current render target
        $isCalonDashboard = true; // For the purpose of this edit, assuming it's true based on the original render 'Dashboard/Index-calon'

        $provinceDetails = [];

        $provinceDetailsRaw = \App\Models\UserCalon::query()
            ->leftJoin('pekerjaans', 'user_calon.pekerjaan_id', '=', 'pekerjaans.id')
            ->select(
                'user_calon.province_id',
                \Illuminate\Support\Facades\DB::raw('COALESCE(pekerjaans.name, "Lainnya") as pekerjaan'),
                'user_calon.jenis_kelamin',
                \Illuminate\Support\Facades\DB::raw('count(*) as total')
            )
            ->whereNotNull('user_calon.province_id')
            ->groupBy('user_calon.province_id', 'pekerjaans.name', 'user_calon.jenis_kelamin')
            ->get();

        foreach ($provinceDetailsRaw as $row) {
            $pid = $row->province_id;
            $pekerjaan = $row->pekerjaan;
            
            if (!isset($provinceDetails[$pid])) {
                $provinceDetails[$pid] = [];
            }
        
            // Find existing entry for this job or create new
            $found = false;
            foreach ($provinceDetails[$pid] as &$entry) {
                if ($entry['name'] === $pekerjaan) {
                    $genderKey = ($row->jenis_kelamin === 'L' || $row->jenis_kelamin === 'Laki-laki') ? 'L' : 'P';
                    $entry[$genderKey] += $row->total;
                    $entry['total'] += $row->total;
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                $genderKey = ($row->jenis_kelamin === 'L' || $row->jenis_kelamin === 'Laki-laki') ? 'L' : 'P';
                $provinceDetails[$pid][] = [
                    'name' => $pekerjaan,
                    'L' => $genderKey === 'L' ? $row->total : 0,
                    'P' => $genderKey === 'P' ? $row->total : 0,
                    'total' => $row->total,
                ];
            }
        }
        
        return Inertia::render('Dashboard/Index-calon', [
            'matraCounts' => $matraCounts,
            'stats' => [
                'sent' => $totalSent,
                'inbox' => $totalInbox,
                'pending' => $pendingApprovals,
            ],
            'chartData' => $lettersPerMonth,
            'activities' => $activities,
            'usersByProvince' => $usersByProvince,
            'provinceDetails' => $provinceDetails,
            'totalUsers' => $totalUsers,
            'adminStats' => $adminStats,
        ]);
        // return Inertia::render('Dashboard/Index', [
        //     'stats' => [
        //         'sent' => $totalSent,
        //         'inbox' => $totalInbox,
        //         'pending' => $pendingApprovals,
        //     ],
        //     'chartData' => $lettersPerMonth,
        //     'activities' => $activities,
        //     'usersByProvince' => $usersByProvince,
        //     'totalUsers' => $totalUsers,
        //     'adminStats' => $adminStats, // New prop
        // ]);
    }
}