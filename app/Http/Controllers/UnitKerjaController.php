<?php

namespace App\Http\Controllers;

use App\Models\UnitKerja;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitKerjaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = UnitKerja::with('parent');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%");
        }

        $unitKerja = $query->orderBy('nama')->paginate(10)->withQueryString();

        // Get all unit kerja for parent dropdown
        $allUnitKerja = UnitKerja::active()->orderBy('nama')->get();

        return Inertia::render('DataMaster/UnitKerja/Index', [
            'unitKerja' => $unitKerja,
            'allUnitKerja' => $allUnitKerja,
            'filters' => $request->only(['search']),
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:unit_kerja,nama',
            'kode' => 'nullable|string|max:50|unique:unit_kerja,kode',
            'parent_id' => 'nullable|exists:unit_kerja,id',
            'is_active' => 'boolean',
        ]);

        UnitKerja::create($validated);

        return redirect()->route('unit-kerja.index')
            ->with('success', 'Unit Kerja berhasil ditambahkan.');
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UnitKerja $unitKerja)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:unit_kerja,nama,' . $unitKerja->id,
            'kode' => 'nullable|string|max:50|unique:unit_kerja,kode,' . $unitKerja->id,
            'parent_id' => 'nullable|exists:unit_kerja,id',
            'is_active' => 'boolean',
        ]);

        // Prevent setting parent to itself or its children
        if ($validated['parent_id'] == $unitKerja->id) {
            return back()->withErrors(['parent_id' => 'Unit Kerja tidak boleh menjadi parent dari dirinya sendiri.']);
        }

        $unitKerja->update($validated);

        return redirect()->route('unit-kerja.index')
            ->with('success', 'Unit Kerja berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UnitKerja $unitKerja)
    {
        // Check if has children
        if ($unitKerja->children()->count() > 0) {
            return back()->withErrors(['delete' => 'Unit Kerja tidak dapat dihapus karena masih memiliki sub unit.']);
        }

        $unitKerja->delete();

        return redirect()->route('unit-kerja.index')
            ->with('success', 'Unit Kerja berhasil dihapus.');
    }
}
