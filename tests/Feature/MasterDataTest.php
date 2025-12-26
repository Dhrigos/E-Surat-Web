<?php

use App\Models\User;
use App\Models\Jabatan;
use App\Models\UnitKerja;
use App\Models\LetterType;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    // Setup roles and permissions
    $role = Role::firstOrCreate(['name' => 'super-admin']);
    $user = User::factory()->verified()->create();
    $user->assignRole($role);
    $this->actingAs($user);
});

test('can list jabatans', function () {
    Jabatan::factory()->create(['nama' => 'Kepala Dinas']);

    $response = $this->get(route('jabatan.index'));

    $response->assertStatus(200);
});

test('can create jabatan', function () {
    $response = $this->post(route('jabatan.store'), [
        'nama' => 'New Jabatan',
        'keterangan' => 'Description',
    ]);

    $response->assertRedirect(route('jabatan.index'));
    $this->assertDatabaseHas('jabatan', ['nama' => 'New Jabatan']);
});

test('can update jabatan', function () {
    $jabatan = Jabatan::factory()->create();

    $response = $this->put(route('jabatan.update', $jabatan), [
        'nama' => 'Updated Jabatan',
        'keterangan' => 'Updated Description',
    ]);

    $response->assertRedirect(route('jabatan.index'));
    $this->assertDatabaseHas('jabatan', ['id' => $jabatan->id, 'nama' => 'Updated Jabatan']);
});

test('can delete jabatan', function () {
    $jabatan = Jabatan::factory()->create();

    $response = $this->delete(route('jabatan.destroy', $jabatan));

    $response->assertRedirect(route('jabatan.index'));
    $this->assertDatabaseMissing('jabatan', ['id' => $jabatan->id]);
});

test('can list unit kerja', function () {
    UnitKerja::factory()->create(['nama' => 'Sekretariat']);

    $response = $this->get(route('unit-kerja.index'));

    $response->assertStatus(200);
});

test('can create unit kerja', function () {
    $response = $this->post(route('unit-kerja.store'), [
        'nama' => 'New Unit',
        'kode' => 'NEW',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('unit-kerja.index'));
    $this->assertDatabaseHas('unit_kerja', ['nama' => 'New Unit']);
});

test('can list letter types', function () {
    $response = $this->get(route('master-data.index'));
    $response->assertStatus(200);
});

test('can create letter type', function () {
    $response = $this->post(route('master-data.store'), [
        'name' => 'Surat Tugas',
        'code' => 'ST',
        'description' => 'Surat Tugas',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('letter_types', ['code' => 'ST']);
});
