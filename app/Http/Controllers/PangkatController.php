<?php

namespace App\Http\Controllers;

use App\Models\Pangkat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PangkatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Pangkat::with(['statusKeanggotaans' => function($query) {
            $query->select('status_keanggotaans.id', 'status_keanggotaans.nama')
                  ->wherePivot('is_active', true);
        }]);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%");
        }

        $pangkat = $query->ordered()->paginate(10)->withQueryString();

        return Inertia::render('DataMaster/Pangkat/Index', [
            'pangkat' => $pangkat,
            'filters' => $request->only(['search']),
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:pangkat,nama',
            'kode' => 'nullable|string|max:50|unique:pangkat,kode',
            'tingkat' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        Pangkat::create($validated);

        return redirect()->route('pangkat.index')
            ->with('success', 'Pangkat berhasil ditambahkan.');
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pangkat $pangkat)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:pangkat,nama,' . $pangkat->id,
            'kode' => 'nullable|string|max:50|unique:pangkat,kode,' . $pangkat->id,
            'tingkat' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $pangkat->update($validated);

        return redirect()->route('pangkat.index')
            ->with('success', 'Pangkat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pangkat $pangkat)
    {
        $pangkat->delete();

        return redirect()->route('pangkat.index')
            ->with('success', 'Pangkat berhasil dihapus.');
    }
}
