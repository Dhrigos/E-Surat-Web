<?php

namespace App\Http\Controllers\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use App\Models\JabatanRole;
use App\Models\LetterType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataMasterController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->query('tab', 'ranks');

        // Statistics for Summary Cards
        $stats = [
            'total_units' => Jabatan::count(),
            'total_roles' => JabatanRole::count(),
            'total_templates' => LetterType::count(),
            'total_ranks' => \App\Models\Golongan::count() + \App\Models\Pangkat::count(),
        ];

        $data = [];

        // Fetch Data based on Active Tab
        switch ($activeTab) {
            case 'ranks':
                $data = $this->getRanksData($request);
                break;
            case 'units':
                $data = $this->getUnitsData($request);
                break;
            case 'roles':
                $data = $this->getRolesData($request);
                break;
            case 'templates':
                $data = $this->getTemplatesData($request);
                break;
        }

        if (empty($activeTab) || $activeTab == 'users') {
             // Fallback if someone tries 'users' or empty: redirect to ranks as default or just load ranks if appropriate
             // But existing code sets default to 'users', so let's change default to 'ranks' or 'units' logic
             // But simpler is to handling 'users' case removal if we want strict removal.
             // If $activeTab is 'users', we should probably redirect or show 404.
             // But since we want to *replace* it, let's just make 'ranks' the default?
        }


        return Inertia::render('DataMaster/Index', [
            'activeTab' => $activeTab,
            'stats' => $stats,
            'data' => $data,
            'filters' => $request->only(['search', 'parent_id', 'kategori']),
        ]);
    }

    private function getRanksData(Request $request)
    {
        // Simple fetch all (simulating what MasterDataController does, but maybe we want pagination if too many?)
        // MasterDataController fetches all. Let's stick to that for now as they are usually small.
        // OR paginate if we want to be fancy.
        // RankTab expects: { golongans: [], pangkats: [] }
        
        $golongans = \App\Models\Golongan::orderBy('nama')->get();
        $pangkats = \App\Models\Pangkat::with('golongan')->orderBy('nama')->get();

        return [
            'golongans' => $golongans,
            'pangkats' => $pangkats,
        ];
    }

    private function getUnitsData(Request $request)
    {
        $parentId = $request->input('parent_id');
        $query = Jabatan::withCount('children');

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%");
            });
        } else {
            if ($request->has('parent_id')) {
                $query->where('parent_id', $parentId);
            } else {
                $query->whereNull('parent_id');
            }
        }

        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        $jabatan = $query->orderBy('level')->orderBy('nama')->paginate(50)->withQueryString();

        // Breadcrumbs
        $parent = $parentId ? Jabatan::with('parent')->find($parentId) : null;
        $breadcrumbs = [];
        $curr = $parent ? $parent->parent : null;
        while ($curr) {
            array_unshift($breadcrumbs, $curr);
            $curr = $curr->parent;
        }

        return [
            'units' => $jabatan,
            'current_parent' => $parent,
            'breadcrumbs' => $breadcrumbs,
        ];
    }

    private function getRolesData(Request $request)
    {
        $query = JabatanRole::query()
            ->with(['children' => function ($q) {
                $q->orderBy('level', 'asc');
            }, 'children.children'])
            ->whereNull('parent_id');

        if ($request->has('search')) {
             $query->where('nama', 'like', "%{$request->search}%");
        }

        $roles = $query->orderBy('level', 'asc')->paginate(50)->withQueryString();

        return [
            'roles' => $roles,
        ];
    }

    private function getTemplatesData(Request $request)
    {
        $query = LetterType::query();

        if ($request->has('search')) {
             $search = $request->search;
             $query->where(function ($q) use ($search) {
                 $q->where('name', 'like', "%{$search}%")
                   ->orWhere('code', 'like', "%{$search}%");
             });
        }

        $templates = $query->with(['approvalWorkflows.steps'])
             ->orderBy('name')
             ->paginate(50)
             ->withQueryString();

        return [
            'templates' => $templates,
        ];
    }
}
