<?php

namespace Tests\Feature;

use App\Models\Jabatan;
use App\Models\JabatanRole;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\Staff;
use App\Models\Pangkat;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MasterDataSuperiorTest extends TestCase
{
    use DatabaseTransactions;

    public function test_get_superior_returns_same_unit_head_if_user_is_staff()
    {
        // Setup Hierarchy:
        // Unit A
        //  - Kepala (Role Level 1)
        //  - Staff (Role Level 2)

        // Create Jabatan (Unit)
        $unitA = Jabatan::create([
            'nama' => 'Unit A',
            'level' => 1,
            'kategori' => 'struktural'
        ]);

        // Create Parent Unit
        $parentUnit = Jabatan::create([
            'nama' => 'Parent Unit',
            'level' => 0,
            'kategori' => 'struktural'
        ]);
        $unitA->parent_id = $parentUnit->id;
        $unitA->save();

        // Create Roles
        $roleKepala = JabatanRole::create(['nama' => 'Kepala', 'level' => 1, 'is_active' => true]);
        $roleStaff = JabatanRole::create(['nama' => 'Staff', 'level' => 2, 'is_active' => true]);

        // Create Users
        $kepala = User::factory()->create(['name' => 'Pak Kepala']);
        // Create Dummy Manager to satisfy DB constraint but bypass logic
        $dummyManager = User::factory()->create(['name' => 'Dummy Manager']); 

        $staff = User::factory()->create(['name' => 'Si Staff']);

        // Assign Roles & Unit
        // Kepala
        UserDetail::create([
            'user_id' => $kepala->id,
            'jabatan_role_id' => $roleKepala->id,
            'jabatan_id' => $unitA->id // Detailed assignment
        ]);
        Staff::create([
            'user_id' => $kepala->id,
            'jabatan_id' => $unitA->id,
            'pangkat_id' => Pangkat::factory()->create()->id,
            'status' => 'active',
            'manager_id' => $dummyManager->id, // Required field
            'nip' => '1234567890',
            'email' => 'kepala@example.com',
            'name' => 'Pak Kepala',
            'role' => 'manager',
            'tanggal_masuk' => now(),
        ]);

        // Staff
        UserDetail::create([
            'user_id' => $staff->id,
            'jabatan_role_id' => $roleStaff->id,
            'jabatan_id' => $unitA->id
        ]);
        Staff::create([
            'user_id' => $staff->id,
            'jabatan_id' => $unitA->id,
            'pangkat_id' => Pangkat::first()->id,
            'status' => 'active',
            'manager_id' => $dummyManager->id, // Bypass Override because dummy has no roles
            'nip' => '0987654321',
            'email' => 'staff@example.com',
            'name' => 'Si Staff',
            'role' => 'staff',
            'tanggal_masuk' => now(),
        ]);

        // Act: Get Superior for Staff
        // Since Dummy Manager has no roles, getSuperior's "Manager Check" should fail condition ($managerHasJabatan).
        // It should fall through to our New Structural Logic (Same Unit Check).
        $response = $this->actingAs($staff)->getJson('/api/users/superior?user_id=' . $staff->id);

        // Assert
        $response->assertStatus(200);
        
        // Should return Unit A (Same Unit) -> Correct Logic
        $response->assertJsonPath('jabatan.id', $unitA->id);
        
        // Users should contain Pak Kepala
        $response->assertJsonFragment(['name' => 'Pak Kepala']);
        
        // Verify Position Name Format
        $response->assertJsonFragment(['position_name' => 'Kepala Unit A']);
    }

    public function test_get_superior_returns_parent_unit_head_if_user_is_head()
    {
         // Setup Hierarchy:
        // Parent Unit
        //  - Direktur (Role Level 1)
        //  - Unit A (Child of Parent)
        //      - Kepala (Role Level 2 - relative global or local? Seeder implies level is global or per parent)
        //      Let's assume Global Level: Direktur=1, Kepala=2. 
        
        // Create Parent Unit
        $parentUnit = Jabatan::create([
            'nama' => 'Parent Unit',
            'level' => 0,
            'kategori' => 'struktural'
        ]);
        
         // Create Child Unit
        $unitA = Jabatan::create([
            'nama' => 'Unit A',
            'level' => 1,
            'kategori' => 'struktural',
            'parent_id' => $parentUnit->id
        ]);

        // Create Roles
        $roleDirektur = JabatanRole::create(['nama' => 'Direktur', 'level' => 1, 'is_active' => true]);
        $roleKepala = JabatanRole::create(['nama' => 'Kepala', 'level' => 2, 'is_active' => true]);

        // Create Users
        $direktur = User::factory()->create(['name' => 'Pak Direktur']);
        $kepala = User::factory()->create(['name' => 'Pak Kepala Unit']);
        $dummyManager = User::factory()->create(['name' => 'Dummy Manager']);

        // Assign
        // Direktur in Parent Unit
        UserDetail::create([
            'user_id' => $direktur->id,
            'jabatan_role_id' => $roleDirektur->id,
            'jabatan_id' => $parentUnit->id
        ]);
        Staff::create([
            'user_id' => $direktur->id,
            'jabatan_id' => $parentUnit->id,
            'pangkat_id' => Pangkat::factory()->create()->id,
            'status' => 'active',
            'manager_id' => $dummyManager->id,
            'nip' => '111222333444',
            'email' => 'direktur@example.com',
            'name' => 'Pak Direktur',
            'role' => 'manager',
            'tanggal_masuk' => now(),
        ]);

        // Kepala in Unit A
        UserDetail::create([
            'user_id' => $kepala->id,
            'jabatan_role_id' => $roleKepala->id,
            'jabatan_id' => $unitA->id
        ]);
        Staff::create([
            'user_id' => $kepala->id,
            'jabatan_id' => $unitA->id,
            'pangkat_id' => Pangkat::first()->id,
            'status' => 'active',
            'manager_id' => $dummyManager->id,
            'nip' => '555666777888',
            'email' => 'kepalaunit@example.com',
            'name' => 'Pak Kepala Unit',
            'role' => 'supervisor',
            'tanggal_masuk' => now(),
        ]);

        // Act: Get Superior for Kepala Unit (who is highest in his unit)
        $response = $this->actingAs($kepala)->getJson('/api/users/superior?user_id=' . $kepala->id);

        // Assert
        $response->assertStatus(200);
        
        // Should return Parent Unit
        $response->assertJsonPath('jabatan.id', $parentUnit->id);
        
        // Users should contain Pak Direktur
        $response->assertJsonFragment(['name' => 'Pak Direktur']);
        
         // Verify Position Name Format
        $response->assertJsonFragment(['position_name' => 'Direktur Parent Unit']);
    }
}
