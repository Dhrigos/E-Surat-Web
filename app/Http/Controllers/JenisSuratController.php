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

        $jenisSurat = $query->with(['approvalWorkflows.steps'])
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

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

    /**
     * Get workflow configuration for a letter type.
     */
    public function getWorkflow(string $id)
    {
        $letterType = LetterType::findOrFail($id);

        // Ensure a workflow exists
        $workflow = $letterType->approvalWorkflows()->firstOrCreate(
            ['letter_type_id' => $letterType->id],
            [
                'name' => 'Workflow '.$letterType->name,
                'description' => 'Approval workflow for '.$letterType->name,
            ]
        );

        // Load steps with relationships
        $workflow->load(['steps.group', 'steps.approverJabatan']);

        // Transform steps to frontend format
        $frontendSteps = [];
        $rawSteps = $workflow->steps->sortBy('order');
        $processedGroupIds = [];

        foreach ($rawSteps as $step) {
            if ($step->step_type === 'sequential' && ! $step->group_id) {
                $frontendSteps[] = [
                    'id' => $step->id,
                    'type' => 'sequential',
                    'jabatan_id' => $step->approver_id,
                    'jabatan_nama' => $step->approverJabatan?->nama_lengkap ?? $step->approverJabatan?->nama,
                    'approver_type' => $step->approver_type,
                    'description' => $step->description,
                ];
            } elseif ($step->group_id) { // Treat any step with a group_id as parallel
                // Determine if we already processed this group
                // Determine if we already processed this group
                if (in_array($step->group_id, $processedGroupIds)) {
                    continue;
                }

                // Find all steps in this group
                $groupSteps = $rawSteps->where('group_id', $step->group_id);
                $group = $step->group;

                $approvers = $groupSteps->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'jabatan_id' => $s->approver_id,
                        'approver_type' => $s->approver_type,
                        'jabatan_nama' => $s->approverJabatan?->nama, // Optional: preload name
                    ];
                })->values()->all();

                $frontendSteps[] = [
                    'id' => $step->id, // Use ID of first step as reference
                    'type' => 'parallel',
                    'approval_type' => $group ? $group->approval_type : 'any',
                    'description' => $group ? $group->description : 'Parallel Group',
                    'approvers' => $approvers,
                ];

                $processedGroupIds[] = $step->group_id;
            }
        }

        return response()->json([
            'workflow' => $workflow,
            'steps' => $frontendSteps,
        ]);
    }

    /**
     * Update workflow configuration.
     */
    public function updateWorkflow(Request $request, string $id)
    {
        $letterType = LetterType::findOrFail($id);
        $workflow = $letterType->approvalWorkflows()->first();

        // Transaction to ensure atomicity
        \DB::transaction(function () use ($workflow, $request) {
            // Detach/Delete existing steps to rewrite them (Simplest approach for this editor)
            // Real-world might want more smart diffing, but for this "Card Editor", full replace is safer.
            $workflow->steps()->delete();
            // Also delete groups if any (will need to check cascade, but for now manual cleanup)
            $workflow->groups()->delete();

            $stepsData = $request->input('steps', []);

            foreach ($stepsData as $index => $stepData) {
                // If it's a parallel group
                if (isset($stepData['type']) && $stepData['type'] === 'parallel') {
                    $group = $workflow->groups()->create([
                        'group_order' => $index + 1,
                        'approval_type' => $stepData['approval_type'] ?? 'all', // 'all' or 'any'
                        'description' => $stepData['description'] ?? 'Parallel Group',
                    ]);

                    foreach ($stepData['approvers'] as $subIndex => $approver) {
                        $workflow->steps()->create([
                            'order' => $index + 1, // Same order for parallel? Or sub-order?
                            // Actually, WorkflowService handles parallel based on 'group_id' and 'step_type'='parallel'
                            'step_type' => 'parallel',
                            'group_id' => $group->id,
                            'approver_type' => 'jabatan',
                            'approver_id' => $approver['jabatan_id'],
                            'is_required' => true,
                        ]);
                    }
                } else {
                    // Sequential Step
                    $workflow->steps()->create([
                        'order' => $index + 1,
                        'step_type' => 'sequential',
                        'approver_type' => 'jabatan',
                        'approver_id' => $stepData['jabatan_id'],
                        'is_required' => true,
                    ]);
                }
            }
        });

        return back()->with('success', 'Workflow berhasil diperbarui.');
    }
}
