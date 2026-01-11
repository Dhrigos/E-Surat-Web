<?php

namespace App\Http\Controllers;

use App\Models\LetterType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenisSuratController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LetterType::query();

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $jenisSurat = $query->orderBy('name')->paginate(50)->withQueryString();

        return Inertia::render('DataMaster/JenisSurat/Index', [
            'jenisSurat' => $jenisSurat,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:letter_types,code',
            'description' => 'nullable|string',
        ]);

        LetterType::create($validated);

        return redirect()->route('jenis-surat.index')
            ->with('success', 'Jenis Surat berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $letterType = LetterType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:letter_types,code,'.$letterType->id,
            'description' => 'nullable|string',
        ]);

        $letterType->update($validated);

        return redirect()->route('jenis-surat.index')
            ->with('success', 'Jenis Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $letterType = LetterType::findOrFail($id);

        // Check if used in letters
        if ($letterType->letters()->exists()) {
            return redirect()->back()->with('error', 'Jenis Surat tidak dapat dihapus karena sudah digunakan dalam surat.');
        }

        $letterType->delete();

        return redirect()->route('jenis-surat.index')
            ->with('success', 'Jenis Surat berhasil dihapus.');
    }
}
