<?php

namespace App\Http\Controllers;

use App\Models\StatusKeanggotaan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatusKeanggotaanController extends Controller
{
    public function index(Request $request)
    {
        $query = StatusKeanggotaan::with([
            'jabatans' => function($query) {
                $query->select('jabatan.id', 'jabatan.nama')
                      ->wherePivot('is_active', true);
            },
            'pangkats' => function($query) {
                $query->select('pangkat.id', 'pangkat.nama', 'pangkat.kode')
                      ->wherePivot('is_active', true);
            }
        ]);

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        $statusKeanggotaan = $query->orderBy('nama')->get();

        return Inertia::render('DataMaster/StatusKeanggotaan/Index', [
            'statusKeanggotaan' => $statusKeanggotaan,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:status_keanggotaans,nama',
            'keterangan' => 'nullable|string|max:255',
        ]);

        StatusKeanggotaan::create($validated);

        return redirect()->back()->with('success', 'Status Keanggotaan berhasil ditambahkan.');
    }

    public function update(Request $request, StatusKeanggotaan $statusKeanggotaan)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:status_keanggotaans,nama,' . $statusKeanggotaan->id,
            'keterangan' => 'nullable|string|max:255',
        ]);

        $statusKeanggotaan->update($validated);

        return redirect()->back()->with('success', 'Status Keanggotaan berhasil diperbarui.');
    }

    public function destroy(StatusKeanggotaan $statusKeanggotaan)
    {
        $statusKeanggotaan->delete();

        return redirect()->back()->with('success', 'Status Keanggotaan berhasil dihapus.');
    }
}
