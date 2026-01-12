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
            ->orderBy('nama')
            ->paginate(10)
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

        \App\Models\JabatanRole::create([
            'nama' => $request->nama,
            'is_active' => true,
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
}
