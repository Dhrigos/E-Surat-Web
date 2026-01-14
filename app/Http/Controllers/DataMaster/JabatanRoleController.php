<?php

namespace App\Http\Controllers\DataMaster;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JabatanRoleController extends Controller
{
    public function index()
    {
        $roles = \App\Models\JabatanRole::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%");
            })
            ->orderByLevel()
            ->paginate(50) // Increased pagination for DnD convenience
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
