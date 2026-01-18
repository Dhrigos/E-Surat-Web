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
        $parentId = $request->input('parent_id');

        $query = Jabatan::withCount('children');

        // Search
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%");
            });
            // When searching, we typically want to find items anywhere, so we DON'T filter by parent_id
            // unless the user explicitly wants to search within a folder.
            // But for simple "File Manager" style, usually search is global or flattened.
            // If we want to keep drill-down context, we keep parent_id.
            // The user said "search filter belum kepake", likely meaning they can't find things.
            // Let's make search global for now (ignoring parent_id).
            // But if we ignore parent_id, the UI needs to handle showing "Path" or something.
            // For now, let's just make sure Search takes precedence over Parent_id in the query construction if we want global.
            // Current code adds parent_id filter BEFORE search.
        } else {
            // Hierarchy Filter only if NOT searching (or handle combo)
            if ($request->has('parent_id')) {
                $query->where('parent_id', $parentId);
            } else {
                $query->whereNull('parent_id');
            }
        }

        // Filter by Kategori
        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        $jabatan = $query->orderBy('level')->orderBy('nama')->paginate(50)->withQueryString();

        // Get parent for breadcrumbs
        $parent = $parentId ? Jabatan::with('parent')->find($parentId) : null;
        $breadcrumbs = [];
        $curr = $parent ? $parent->parent : null; // Start from parent's parent to avoid duplication
        while ($curr) {
            array_unshift($breadcrumbs, $curr);
            $curr = $curr->parent;
        }

        return Inertia::render('DataMaster/Jabatan/Index', [
            'jabatan' => $jabatan,
            'filters' => $request->only(['search', 'parent_id', 'kategori']),
            'currentParent' => $parent,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:jabatan,nama',
            'kategori' => 'required|in:struktural,fungsional,anggota',
            // 'level' => 'required|integer', // Calculated automatically
            'parent_id' => 'nullable|exists:jabatan,id',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Auto-calculate level
        if (! empty($validated['parent_id'])) {
            $parent = Jabatan::find($validated['parent_id']);
            $validated['level'] = $parent ? $parent->level + 1 : 1;
        } else {
            $validated['level'] = 1; // Root level
        }

        Jabatan::create($validated);

        return redirect()->route('data-master.index', ['tab' => 'units', 'parent_id' => $validated['parent_id'] ?? null])
            ->with('success', 'Jabatan berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Jabatan $jabatan)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:jabatan,nama,'.$jabatan->id,
            'kategori' => 'required|in:struktural,fungsional,anggota',
            // 'level' => 'required|integer', // Calculated automatically
            'parent_id' => 'nullable|exists:jabatan,id',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Auto-calculate level if parent changes or just ensure consistency
        if (array_key_exists('parent_id', $validated)) {
            if (! empty($validated['parent_id'])) {
                $parent = Jabatan::find($validated['parent_id']);
                $validated['level'] = $parent ? $parent->level + 1 : 1;
            } else {
                $validated['level'] = 1; // Root level
            }
        }

        $jabatan->update($validated);

        return redirect()->route('data-master.index', ['tab' => 'units', 'parent_id' => $validated['parent_id'] ?? $jabatan->parent_id])
            ->with('success', 'Jabatan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Jabatan $jabatan)
    {
        $jabatan->delete();

        return redirect()->route('data-master.index', ['tab' => 'units'])
            ->with('success', 'Jabatan berhasil dihapus.');
    }
}
