<?php

namespace App\Http\Controllers;

use App\Models\LetterType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index()
    {
        return Inertia::render('MasterData/Index', [
            'golongans' => \App\Models\Golongan::orderBy('nama')->get(),
            'pangkats' => \App\Models\Pangkat::with('golongan')->orderBy('nama')->get(),
        ]);
    }

    public function storeGolongan(Request $request)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:golongans,nama']);
        \App\Models\Golongan::create($request->all());
        return redirect()->back()->with('success', 'Golongan berhasil ditambahkan');
    }

    public function updateGolongan(Request $request, $id)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:golongans,nama,'.$id]);
        \App\Models\Golongan::findOrFail($id)->update($request->all());
        return redirect()->back()->with('success', 'Golongan berhasil diperbarui');
    }

    public function destroyGolongan($id)
    {
        \App\Models\Golongan::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Golongan berhasil dihapus');
    }

    public function storePangkat(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:pangkat,nama',
            'golongan_id' => 'nullable|exists:golongans,id'
        ]);
        \App\Models\Pangkat::create($request->all());
        return redirect()->back()->with('success', 'Pangkat berhasil ditambahkan');
    }

    public function updatePangkat(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:pangkat,nama,'.$id,
            'golongan_id' => 'nullable|exists:golongans,id'
        ]);
        \App\Models\Pangkat::findOrFail($id)->update($request->all());
        return redirect()->back()->with('success', 'Pangkat berhasil diperbarui');
    }

    public function destroyPangkat($id)
    {
        \App\Models\Pangkat::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Pangkat berhasil dihapus');
    }

    public function getLetterTypes()
    {
        return response()->json(LetterType::select('id', 'name', 'code', 'description')->get());
    }

    public function getJabatan()
    {
        // Eager load parent to ensure 'nama_lengkap' accessor works correctly without N+1
        return response()->json(\App\Models\Jabatan::select('id', 'nama', 'parent_id', 'level')
            ->with('parent:id,nama') // Optimize: only select needed columns from parent
            ->orderBy('nama')
            ->get());
    }

    public function getUsersByJabatan(Request $request)
    {
        $jabatanId = $request->query('jabatan_id');

        if (! $jabatanId) {
            return response()->json([]);
        }

        $users = \App\Models\User::whereHas('staff', function ($q) use ($jabatanId) {
            $q->where('jabatan_id', $jabatanId)
                ->where('status', 'active');
        })->select('id', 'name', 'username')->get();

        return response()->json($users);
    }

    public function getOrganizationTree()
    {
        $nodes = \App\Models\Jabatan::with('children')->whereNull('parent_id')->get();

        return response()->json($nodes);
    }

    // Legacy methods removed. Use JenisSuratController/JabatanController instead.
}
