<?php

namespace Database\Seeders;

use App\Models\ApprovalWorkflow;
use App\Models\ApprovalWorkflowStep;
use App\Models\Jabatan;
use App\Models\LetterType;
use Illuminate\Database\Seeder;

class LetterSettingSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding Letter Types...');
        // 1. Letter Types
        $types = [
            ['name' => 'Surat Dinas', 'code' => 'SD', 'description' => 'Surat resmi kedinasan'],
            ['name' => 'Surat Undangan', 'code' => 'SU', 'description' => 'Undangan rapat atau kegiatan'],
            ['name' => 'Surat Tugas', 'code' => 'ST', 'description' => 'Surat penugasan pegawai'],
            ['name' => 'Surat Edaran', 'code' => 'SE', 'description' => 'Surat edaran resmi'],
            ['name' => 'Nota Dinas', 'code' => 'ND', 'description' => 'Nota dinas internal'],
        ];

        foreach ($types as $type) {
            LetterType::firstOrCreate(['code' => $type['code']], $type);
        }

        $this->command->info('Seeding Workflows...');
        // 3. Default Workflows
        $letterTypes = \App\Models\LetterType::all();

        foreach ($letterTypes as $type) {
            $workflow = ApprovalWorkflow::firstOrCreate(
                ['name' => 'Default Workflow for '.$type->name, 'letter_type_id' => $type->id],
                ['description' => 'Standard approval flow for '.$type->name]
            );

            // Create Steps: Kasubag -> Sekretaris -> Kadis
            $steps = [
                ['order' => 1, 'approver_type' => 'jabatan', 'approver_id' => (string) Jabatan::where('nama', 'Kepala Sub Bagian')->first()?->id],
                ['order' => 2, 'approver_type' => 'jabatan', 'approver_id' => (string) Jabatan::where('nama', 'Sekretaris Dinas')->first()?->id],
                ['order' => 3, 'approver_type' => 'jabatan', 'approver_id' => (string) Jabatan::where('nama', 'Kepala Dinas')->first()?->id],
            ];

            foreach ($steps as $step) {
                if ($step['approver_id']) {
                    ApprovalWorkflowStep::firstOrCreate(
                        ['workflow_id' => $workflow->id, 'order' => $step['order']],
                        $step
                    );
                }
            }
        }
    }
}
