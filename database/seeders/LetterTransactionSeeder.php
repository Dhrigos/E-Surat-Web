<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Letter;
use App\Models\LetterType;
use App\Models\LetterApprover;
use App\Models\Disposition;

class LetterTransactionSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('Seeding Letter Transactions...');

        // Retrieve users created by UserSeeder
        $kadis = User::where('username', 'kadis')->first();
        $sekdin = User::where('username', 'sekdin')->first();
        $kabidRen = User::where('username', 'kabid.ren')->first();
        $kasubagRen = User::where('username', 'kasubag.ren')->first();
        $staffRen = User::where('username', 'staff.ren')->first();

        if (!$kadis || !$sekdin || !$kabidRen || !$kasubagRen || !$staffRen) {
            $this->command->error('Users not found. Please run UserSeeder first.');
            return;
        }

        $letterType = LetterType::first(); // Assuming Surat Dinas
        
        if (!$letterType) {
             $this->command->error('LetterType not found. Please run LetterSettingSeeder first.');
             return;
        }

        // Scenario 1: Pending Approval (At Kasubag level)
        $this->createLetterWithWorkflow(
            $staffRen, 
            $letterType, 
            'Surat Permohonan Anggaran (Pending Kasubag)', 
            'pending',
            [$kasubagRen, $kabidRen, $sekdin, $kadis]
        );

        // Scenario 2: Partially Approved (Approved by Kasubag, Pending Kabid)
        $letter2 = $this->createLetterWithWorkflow(
            $staffRen, 
            $letterType, 
            'Laporan Bulanan (Pending Kabid)', 
            'pending',
            [$kasubagRen, $kabidRen, $sekdin, $kadis]
        );
        // Approve first step
        $this->approveStep($letter2, $kasubagRen, 1);

        // Scenario 3: Rejected (Rejected by Kabid)
        $letter3 = $this->createLetterWithWorkflow(
            $staffRen, 
            $letterType, 
            'Usulan Kegiatan (Rejected)', 
            'rejected',
            [$kasubagRen, $kabidRen, $sekdin, $kadis]
        );
        $this->approveStep($letter3, $kasubagRen, 1);
        $this->rejectStep($letter3, $kabidRen, 2, 'Anggaran tidak tersedia.');

        // Scenario 4: Fully Approved
        $letter4 = $this->createLetterWithWorkflow(
            $staffRen, 
            $letterType, 
            'Surat Tugas Luar Kota (Approved)', 
            'approved',
            [$kasubagRen, $kabidRen, $sekdin, $kadis]
        );
        $this->approveStep($letter4, $kasubagRen, 1);
        $this->approveStep($letter4, $kabidRen, 2);
        $this->approveStep($letter4, $sekdin, 3);
        $this->approveStep($letter4, $kadis, 4);

        // 5. Create Dispositions
        // Disposition from Kadis to Kabid Ren
        Disposition::create([
            'letter_id' => $letter4->id,
            'sender_id' => $kadis->id,
            'recipient_id' => $kabidRen->id,
            'instruction' => 'Tindak lanjuti segera.',
            'due_date' => now()->addDays(3),
            'status' => 'pending',
        ]);

        $this->command->info('Letters and Dispositions created.');
    }

    private function createLetterWithWorkflow($creator, $type, $subject, $status, $approvers)
    {
        $letter = Letter::create([
            'created_by' => $creator->id,
            'letter_type_id' => $type->id,
            // 'unit_id' => $creator->staff->unit_kerja_id, // Column doesn't exist
            'subject' => $subject,
            'description' => 'Deskripsi surat ' . $subject,
            'content' => 'Lorem ipsum dolor sit amet...',
            'status' => $status,
            'priority' => 'normal',
            'category' => 'internal',
            // 'date' => now(), // Column doesn't exist
            // 'reference_number' => 'NOMOR/' . rand(100, 999), // Column doesn't exist
        ]);

        // Create Approvers
        foreach ($approvers as $index => $approver) {
            LetterApprover::create([
                'letter_id' => $letter->id,
                'approver_id' => $approver->staff->jabatan->nama, // Store Position Name for display
                'user_id' => $approver->id, // Store User ID for logic
                'order' => $index + 1,
                'status' => 'pending',
            ]);
        }

        return $letter;
    }

    private function approveStep($letter, $user, $order)
    {
        $approver = LetterApprover::where('letter_id', $letter->id)
            ->where('user_id', $user->id)
            ->where('order', $order)
            ->first();

        if ($approver) {
            $approver->update(['status' => 'approved', 'remarks' => 'Ok, lanjut.']);
        }
    }

    private function rejectStep($letter, $user, $order, $reason)
    {
        $approver = LetterApprover::where('letter_id', $letter->id)
            ->where('user_id', $user->id)
            ->where('order', $order)
            ->first();

        if ($approver) {
            $approver->update(['status' => 'rejected', 'remarks' => $reason]);
        }
    }
}
