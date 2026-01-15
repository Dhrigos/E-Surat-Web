<?php

namespace App\Http\Controllers\DataMaster;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JabatanRoleController extends Controller
{
    public function index()
    {
        $roles = \App\Models\JabatanRole::query()
            ->with(['children' => function ($query) {
                $query->orderBy('level', 'asc'); // Order children by hierarchy/rank
            }, 'children.children']) // Load up to 2 levels deep for now, or use recursion if supported/needed
            ->whereNull('parent_id')
            ->when(request('search'), function ($query, $search) {
                // If searching, we might want to ignore hierarchy or search within it.
                // For simplicity, if searching, we might show flat list OR filter parents?
                // Lay's approach: If search exists, show all matching regardless of hierarchy?
                // The user asked for "drill", implying hierarchy is the goal.
                // Let's keep strict hierarchy for now, search only filters roots or we disable search for sub-items?
                // Let's start with basic hierarchy: Roots only.
                // If search is present, we might want to return flat list to find items easily.
                $query->where('nama', 'like', "%{$search}%");
            })
            ->orderBy('level', 'asc')
            // ->orderByLevel() // Or keep level if that's the primary sort
            ->paginate(50)
            ->withQueryString();

        return \Inertia\Inertia::render('DataMaster/JabatanRole/Index', [
            'roles' => $roles,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:jabatan_roles,nama',
        ]);

        // Auto assign next level
        $maxLevel = \App\Models\JabatanRole::max('level') ?? 0;

        \App\Models\JabatanRole::create([
            'nama' => $request->nama,
            'is_active' => true,
            'level' => $maxLevel + 1,
        ]);

        return redirect()->back()->with('success', 'Role berhasil ditambahkan');
    }

    public function update(\Illuminate\Http\Request $request, $id)
    {
        $role = \App\Models\JabatanRole::findOrFail($id);
        
        $request->validate([
            'nama' => 'required|string|max:255|unique:jabatan_roles,nama,' . $id,
            'is_active' => 'boolean',
        ]);

        $role->update($request->only(['nama', 'is_active']));

        return redirect()->back()->with('success', 'Role berhasil diperbarui');
    }

    public function destroy($id)
    {
        $role = \App\Models\JabatanRole::findOrFail($id);
        $role->delete();

        return redirect()->back()->with('success', 'Role berhasil dihapus');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*.id' => 'required|exists:jabatan_roles,id',
            'roles.*.level' => 'required|integer',
        ]);

        foreach ($request->roles as $item) {
            \App\Models\JabatanRole::where('id', $item['id'])->update(['level' => $item['level']]);
        }

        return redirect()->back()->with('success', 'Urutan role berhasil diperbarui');
    }
}
