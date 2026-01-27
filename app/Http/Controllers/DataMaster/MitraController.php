<?php

namespace App\Http\Controllers\DataMaster;

use App\Http\Controllers\Controller;
use App\Models\Mitra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MitraController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'pic' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        
        // Auto-generate Code: MIT-Year-Sequence
        $year = date('Y');
        $lastMitra = Mitra::whereYear('created_at', $year)->latest()->first();
        $sequence = $lastMitra ? intval(substr($lastMitra->code, -4)) + 1 : 1;
        $data['code'] = 'MIT-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);



        Mitra::create($data);

        return redirect()->route('data-master.index', ['tab' => 'mitra'])->with('success', 'Mitra berhasil ditambahkan');
    }

    public function update(Request $request, Mitra $mitra)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'pic' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();

        $mitra->update($data);

        return redirect()->route('data-master.index', ['tab' => 'mitra'])->with('success', 'Mitra berhasil diperbarui');
    }

    public function destroy(Mitra $mitra)
    {
        $mitra->delete();

        return redirect()->route('data-master.index', ['tab' => 'mitra'])->with('success', 'Mitra berhasil dihapus');
    }
}
