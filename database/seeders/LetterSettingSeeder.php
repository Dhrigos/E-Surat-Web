<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LetterType;
use App\Models\Jabatan;
use App\Models\ApprovalWorkflow;
use App\Models\ApprovalWorkflowStep;

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

        $this->command->info('Seeding Letter Templates...');
        // 2. Letter Templates
        $templates = [
            [
                'name' => 'Template Surat Dinas Standar',
                'type' => 'surat_dinas',
                'content' => '
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: "Times New Roman", Times, serif; line-height: 1.5; }
    .header { text-align: center; border-bottom: 3px double black; padding-bottom: 10px; margin-bottom: 20px; }
    .logo { width: 80px; height: auto; position: absolute; left: 0; top: 0; }
    .title { font-size: 16pt; font-weight: bold; }
    .subtitle { font-size: 12pt; }
    .content { margin-top: 20px; text-align: justify; }
    .signature { margin-top: 50px; float: right; width: 40%; text-align: center; }
</style>
</head>
<body>
    <div class="header">
        <!-- <img src="logo_placeholder.png" class="logo" /> -->
        <div class="title">KEMENTERIAN PERTAHANAN REPUBLIK INDONESIA</div>
        <div class="subtitle">BADAN CADANGAN NASIONAL</div>
        <div>Jalan Medan Merdeka Barat No. 13-14, Jakarta Pusat 10110</div>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
        <u style="font-weight: bold; font-size: 14pt;">SURAT DINAS</u><br>
        NOMOR: {{nomor_surat}}
    </div>

    <table>
        <tr><td width="100">Kepada Yth.</td><td>: {{penerima}}</td></tr>
        <tr><td>Dari</td><td>: {{pengirim}}</td></tr>
        <tr><td>Tanggal</td><td>: {{tanggal}}</td></tr>
        <tr><td>Sifat</td><td>: Biasa</td></tr>
        <tr><td>Lampiran</td><td>: -</td></tr>
        <tr><td>Perihal</td><td>: {{perihal}}</td></tr>
    </table>

    <div class="content">
        {{isi}}
    </div>

    <div class="signature">
        <br>
        a.n. KEPALA BADAN CADANGAN NASIONAL<br>
        <br><br><br><br>
        <strong>(Nama Pejabat)</strong><br>
        NIP. ........................
    </div>
</body>
</html>'
            ]
        ];

        foreach ($templates as $tmpl) {
            \App\Models\LetterTemplate::firstOrCreate(['name' => $tmpl['name']], $tmpl);
        }

        $this->command->info('Seeding Workflows...');
        // 3. Default Workflows
        $letterTypes = \App\Models\LetterType::all();
        
        foreach ($letterTypes as $type) {
            $workflow = ApprovalWorkflow::firstOrCreate(
                ['name' => 'Default Workflow for ' . $type->name, 'letter_type_id' => $type->id],
                ['description' => 'Standard approval flow for ' . $type->name]
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
