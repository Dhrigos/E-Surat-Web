<?php

namespace App\Http\Controllers;

use App\Models\LetterTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LetterTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('MasterData/LetterTemplates/Index', [
            'templates' => LetterTemplate::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('MasterData/LetterTemplates/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50|unique:letter_templates,type',
            'content' => 'required|string',
        ]);

        LetterTemplate::create($validated);

        return redirect()->route('letter-templates.index')->with('success', 'Template berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LetterTemplate $letterTemplate)
    {
        return Inertia::render('MasterData/LetterTemplates/Edit', [
            'template' => $letterTemplate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LetterTemplate $letterTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50|unique:letter_templates,type,' . $letterTemplate->id,
            'content' => 'required|string',
        ]);

        $letterTemplate->update($validated);

        return redirect()->route('letter-templates.index')->with('success', 'Template berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LetterTemplate $letterTemplate)
    {
        $letterTemplate->delete();

        return redirect()->back()->with('success', 'Template berhasil dihapus.');
    }
}
