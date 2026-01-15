<?php

namespace Database\Seeders;

use App\Models\JabatanRole;
use Illuminate\Database\Seeder;

class JabatanRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Defined roles with optional children
        // Clear existing roles to avoid duplicates or conflicts with new structure
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        JabatanRole::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $definitions = [
            'Direktorat Jenderal' => [
                'Direktur Jenderal', 
                'Wakil Direktur Jenderal', 
                'Sekretaris', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Direktorat' => [
                'Direktur', 
                'Wakil Direktur', 
                'Sekretaris', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Direktorat Bela Negara & Direktorat Veteran' => [
                'Direktur', 
                'Wakil Direktur', 
                'Sekretaris', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Direktorat Sumber Daya Pertahanan' => [
                'Direktur', 
                'Wakil Direktur', 
                'Sekretaris', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Direktorat Teknologi dan Industri Pertahanan' => [
                'Direktur', 
                'Wakil Direktur', 
                'Sekretaris', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Direktorat Komponen Cadangan' => [
                'Direktur', 
                'Wakil Direktur', 
                'Sekretaris', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Sekretariat' => [
                'Sekretaris Direktorat Jenderal', 
                'Wakil Sekretaris Direktorat Jenderal', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Bagian' => [
                'Kepala Bagian', 
                'Wakil Kepala Bagian', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Subbagian' => [
                'Kepala Subbagian', 
                'Wakil Kepala Subbagian', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Subdirektorat' => [
                'Kepala Subdirektorat', 
                'Wakil kepala Subdirektorat', 
                'Staff', 
                'Staff Administrasi'
            ],
            'Seksi' => [
                'Kepala Seksi', 
                'Staff'
            ],
            'Anggota' => [], // Flat role, no children usually, or maybe it is the child itself?
            // If the user selects UNIT "Anggota", they likely want ROLE "Anggota".
            // So we need a role named "Anggota".
            // But wait, the seeder structure is Parent => [Children].
            // If we put 'Anggota' => [], it creates a Parent Role "Anggota".
            // If we want it to be a child, it needs a parent.
            // But if "Anggota" is a Standalone Role that doesn't need drill down...
            // Let's add it as a key for now.
        ];

        $parentLevelCounter = 1;
        foreach ($definitions as $parentName => $children) {
            $parent = JabatanRole::create([
                'nama' => $parentName,
                'is_active' => true,
                'level' => $parentLevelCounter++
            ]);

            foreach ($children as $index => $childName) {
                JabatanRole::create([
                    'nama' => $childName,
                    'is_active' => true, 
                    'parent_id' => $parent->id,
                    'level' => $index + 1 // Sub-roles/Children logic: 1-based index locally for that parent? 
                    // No, 'level' is used for GLOBAL sorting in the Index view if we just order by 'level' it might mix things up if we aren't careful?
                    // But wait, the Index view renders PARENTS first. 
                    // Then for children, we want to start ordering them.
                    // If we use $index + 1, Direktur is level 1, Wakil level 2. 
                    // Ideally we might want start from 1 for children of THAT parent.
                    // The Controller sorts children by... wait.
                    // `JabatanRoleController::index` loads `children` query.
                    // I need to update the Controller to `orderBy('level')` for children too.
                ]);
            }
        }
    }
}
