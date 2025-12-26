<?php

use App\Models\User;
use App\Models\Staff;
use App\Models\Jabatan;
use App\Models\UnitKerja;
use App\Models\Pangkat;
use App\Models\StatusKeanggotaan;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Setup roles and permissions
    $role = Role::firstOrCreate(['name' => 'manager']);
    \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'view staff']);
    $role->givePermissionTo('view staff');
    $user = User::factory()->verified()->create();
    $user->assignRole($role);
    $this->actingAs($user);

    // Setup Master Data
    $this->jabatan = Jabatan::factory()->create();
    $this->unit = UnitKerja::factory()->create();
    $this->pangkat = Pangkat::firstOrCreate(['nama' => 'Juru', 'kode' => 'I/a', 'tingkat' => 1]);
    $this->status = StatusKeanggotaan::firstOrCreate(['nama' => 'Tetap']);
});

test('can list staff', function () {
    Staff::factory()->count(3)->create();

    $response = $this->get(route('staff.index'));

    $response->assertStatus(200);
});

test('can toggle staff status', function () {
    $staff = Staff::factory()->create(['status' => 'active']);
    $user = $staff->user;
    $user->update(['is_active' => true]);

    $response = $this->put(route('staff.toggle-status', $user));

    $response->assertRedirect();
    $this->assertDatabaseHas('users', ['id' => $user->id, 'is_active' => false]);
});
