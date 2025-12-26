<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\LetterType;
use App\Models\ApprovalWorkflow;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index()
    {
        return Inertia::render('MasterData/Index', [
            'letterTypes' => LetterType::with(['approvalWorkflows.steps', 'template'])->get(),
        ]);
    }

    public function getLetterTypes()
    {
        return response()->json(LetterType::select('id', 'name', 'code', 'description')->get());
    }

    public function getUnitKerjas()
    {
        return response()->json(\App\Models\UnitKerja::select('id', 'nama', 'kode')->get());
    }

    public function getJabatan()
    {
        return response()->json(\App\Models\Jabatan::select('id', 'nama')->orderBy('nama')->get());
    }

    public function getUsersByJabatan(Request $request)
    {
        $jabatanId = $request->query('jabatan_id');
        
        if (!$jabatanId) {
            return response()->json([]);
        }

        $users = \App\Models\User::whereHas('staff', function($q) use ($jabatanId) {
            $q->where('jabatan_id', $jabatanId)
              ->where('status', 'active');
        })->select('id', 'name', 'username')->get();

        return response()->json($users);
    }

    public function getLetterTemplates()
    {
        return response()->json(\App\Models\LetterTemplate::select('id', 'name')->get());
    }

    public function getOrganizationTree()
    {
        $units = \App\Models\UnitKerja::with('children')->whereNull('parent_id')->get();
        return response()->json($units);
    }

    public function getWorkflow(Request $request)
    {
        $letterTypeId = $request->query('letter_type_id');
        $unitId = $request->query('unit_id');
        
        $query = ApprovalWorkflow::where('letter_type_id', $letterTypeId);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        } else {
            $query->whereNull('unit_id');
        }

        $workflow = $query->with(['steps.approverUser.staff.jabatan', 'steps.approverJabatan'])->first();

        if (!$workflow) {
            // Fallback to default if unit specific not found
            if ($unitId) {
                 $workflow = ApprovalWorkflow::where('letter_type_id', $letterTypeId)
                    ->whereNull('unit_id')
                    ->with(['steps.approverUser.staff.jabatan', 'steps.approverJabatan'])
                    ->first();
            }
        }

        if (!$workflow) {
            return response()->json(['steps' => []]);
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
            'template_id' => 'nullable|exists:letter_templates,id',
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
            'template_id' => $validated['template_id'] ?? null,
        ]);

        // Create Workflow
        if (!empty($validated['workflow_steps'])) {
            $workflowName = 'Default Workflow for ' . $letterType->name;
            if (!empty($validated['unit_id'])) {
                $unit = \App\Models\UnitKerja::find($validated['unit_id']);
                $workflowName = 'Workflow ' . $letterType->name . ' - ' . $unit->nama;
            }

            $workflow = ApprovalWorkflow::create([
                'letter_type_id' => $letterType->id,
                'unit_id' => $validated['unit_id'] ?? null,
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
            'code' => 'required|string|max:50|unique:letter_types,code,' . $letterType->id,
            'description' => 'nullable|string',
            'template_id' => 'nullable|exists:letter_templates,id',
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
            'template_id' => $validated['template_id'] ?? null,
        ]);

        // Update Workflow
        // Find workflow for this unit (or null)
        $unitId = $validated['unit_id'] ?? null;
        $workflow = $letterType->approvalWorkflows()
            ->where('unit_id', $unitId)
            ->first();
        
        if (!$workflow) {
            $workflowName = 'Default Workflow for ' . $letterType->name;
            if ($unitId) {
                $unit = \App\Models\UnitKerja::find($unitId);
                $workflowName = 'Workflow ' . $letterType->name . ' - ' . $unit->nama;
            }

            $workflow = ApprovalWorkflow::create([
                'letter_type_id' => $letterType->id,
                'unit_id' => $unitId,
                'name' => $workflowName,
            ]);
        }

        // Sync steps: Delete all and recreate
        $workflow->steps()->delete();

        if (!empty($validated['workflow_steps'])) {
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
