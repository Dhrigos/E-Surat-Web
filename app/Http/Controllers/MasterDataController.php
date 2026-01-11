<?php

namespace App\Http\Controllers;

use App\Models\ApprovalWorkflow;
use App\Models\LetterType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index()
    {
        return Inertia::render('MasterData/Index', [
            'letterTypes' => LetterType::with(['approvalWorkflows.steps'])->get(),
        ]);
    }

    public function getLetterTypes()
    {
        return response()->json(LetterType::select('id', 'name', 'code', 'description')->get());
    }



    public function getJabatan()
    {
        return response()->json(\App\Models\Jabatan::select('id', 'nama')->orderBy('nama')->get());
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

    public function getWorkflow(Request $request)
    {
        $letterTypeId = $request->query('letter_type_id');

        $workflow = ApprovalWorkflow::where('letter_type_id', $letterTypeId)
            ->with(['steps.approverUser.staff.jabatan', 'steps.approverJabatan'])
            ->first();

        if (! $workflow) {
            return response()->json(['steps' => []]);
        }

        if ($workflow) {
            foreach ($workflow->steps as $step) {
                if ($step->approver_type === 'jabatan') {
                    $staffQuery = \App\Models\Staff::where('jabatan_id', $step->approver_id)
                        ->where('status', 'active')
                        ->with('user');

                    $staffGlobal = $staffQuery->first();
                    if ($staffGlobal) {
                        $step->current_holder = $staffGlobal->user;
                    }
                }
            }
        }

        return response()->json($workflow);
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
            'workflow_steps' => 'nullable|array',
            'workflow_steps.*.order' => 'required|integer',
            'workflow_steps.*.approver_type' => 'nullable|in:user,jabatan',
            'workflow_steps.*.approver_id' => 'required',
            'workflow_steps.*.step_type' => 'nullable|in:sequential,parallel,conditional',
            'workflow_steps.*.condition_field' => 'nullable|string',
            'workflow_steps.*.condition_operator' => 'nullable|in:=,!=,>,<,>=,<=,in,not_in',
            'workflow_steps.*.condition_value' => 'nullable',
            'unit_id' => 'nullable|exists:unit_kerja,id',
        ]);

        $letterType = LetterType::create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'],
        ]);

        if (! empty($validated['workflow_steps'])) {
            $workflowName = 'Default Workflow for '.$letterType->name;

            $workflow = ApprovalWorkflow::create([
                'letter_type_id' => $letterType->id,
                'name' => $workflowName,
            ]);

            foreach ($validated['workflow_steps'] as $step) {
                $workflow->steps()->create([
                    'order' => $step['order'],
                    'approver_type' => $step['approver_type'] ?? 'jabatan',
                    'approver_id' => $step['approver_id'],
                    'step_type' => $step['step_type'] ?? 'sequential',
                    'condition_field' => $step['condition_field'] ?? null,
                    'condition_operator' => $step['condition_operator'] ?? null,
                    'condition_value' => $step['condition_value'] ?? null,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Jenis Surat berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LetterType $letterType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:letter_types,code,'.$letterType->id,
            'description' => 'nullable|string',
            'workflow_steps' => 'nullable|array',
            'workflow_steps.*.order' => 'required|integer',
            'workflow_steps.*.approver_type' => 'nullable|in:user,jabatan',
            'workflow_steps.*.approver_id' => 'required',
            'workflow_steps.*.step_type' => 'nullable|in:sequential,parallel,conditional',
            'workflow_steps.*.condition_field' => 'nullable|string',
            'workflow_steps.*.condition_operator' => 'nullable|in:=,!=,>,<,>=,<=,in,not_in',
            'workflow_steps.*.condition_value' => 'nullable',
            'unit_id' => 'nullable|exists:unit_kerja,id',
        ]);

        $letterType->update([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'],
        ]);

        // Update Workflow
        // Find workflow for this unit (or null)
        $workflow = $letterType->approvalWorkflows()
            ->first();

        if (! $workflow) {
            $workflowName = 'Default Workflow for '.$letterType->name;

            $workflow = ApprovalWorkflow::create([
                'letter_type_id' => $letterType->id,
                'name' => $workflowName,
            ]);
        }

        // Sync steps: Delete all and recreate
        $workflow->steps()->delete();

        if (! empty($validated['workflow_steps'])) {
            foreach ($validated['workflow_steps'] as $step) {
                $workflow->steps()->create([
                    'order' => $step['order'],
                    'approver_type' => $step['approver_type'] ?? 'jabatan',
                    'approver_id' => $step['approver_id'],
                    'step_type' => $step['step_type'] ?? 'sequential',
                    'condition_field' => $step['condition_field'] ?? null,
                    'condition_operator' => $step['condition_operator'] ?? null,
                    'condition_value' => $step['condition_value'] ?? null,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Jenis Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LetterType $letterType)
    {
        // Check if used in letters
        if ($letterType->letters()->exists()) {
            return redirect()->back()->with('error', 'Jenis Surat tidak dapat dihapus karena sudah digunakan dalam surat.');
        }

        $letterType->delete();

        return redirect()->back()->with('success', 'Jenis Surat berhasil dihapus.');
    }
}
