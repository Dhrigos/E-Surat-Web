<?php

namespace App\Http\Controllers;

use App\Models\Jabatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JabatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Jabatan::with(['unitKerjas' => function($query) {
            $query->select('unit_kerja.id', 'unit_kerja.nama', 'unit_kerja.kode')
                  ->wherePivot('is_active', true);
        }]);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%");
        }

        $jabatan = $query->orderBy('nama')->paginate(10)->withQueryString();

        return Inertia::render('DataMaster/Jabatan/Index', [
            'jabatan' => $jabatan,
            'filters' => $request->only(['search']),
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:jabatan,nama',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Jabatan::create($validated);

        return redirect()->route('jabatan.index')
            ->with('success', 'Jabatan berhasil ditambahkan.');
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Jabatan $jabatan)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:jabatan,nama,' . $jabatan->id,
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $jabatan->update($validated);

        return redirect()->route('jabatan.index')
            ->with('success', 'Jabatan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Jabatan $jabatan)
    {
        $jabatan->delete();

        return redirect()->route('jabatan.index')
            ->with('success', 'Jabatan berhasil dihapus.');
    }
}
