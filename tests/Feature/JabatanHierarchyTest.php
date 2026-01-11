<?php

namespace Tests\Feature;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JabatanHierarchyTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_jabatan_with_categories()
    {
        $admin = User::factory()->create();
        // Manually mark as verified to bypass middleware
        $admin->markEmailAsVerified();
        $admin->forceFill([
            'verifikasi' => true,
        ])->save();

        // Assign super-admin role (assuming Spatie permission or simple role column)
        // I see 'role' column in Staff, but User might use Spatie.
        // Let's assume there is a way. Checking User model would be best.
        // For now, let's try acting as this user and see.
        // Actually, route says: middleware(['role:super-admin'])
        // So I need to assign role.
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super-admin']);
        $admin->assignRole($role);

        $this->actingAs($admin);

        $response = $this->post(route('jabatan.store'), [
            'nama' => 'Direktur Jenderal',
            'kategori' => 'struktural',
            // 'level' => 1, // Auto-calculated
            'is_active' => true,
        ]);

        $response->assertRedirect(route('jabatan.index'));

        $this->assertDatabaseHas('jabatan', [
            'nama' => 'Direktur Jenderal',
            'kategori' => 'struktural',
            'level' => 1, // Should be 1 for root
        ]);
    }

    public function test_auto_level_calculation_for_child()
    {
        $admin = User::factory()->create();
        $admin->markEmailAsVerified();
        $admin->forceFill(['verifikasi' => true])->save();
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super-admin']);
        $admin->assignRole($role);
        $this->actingAs($admin);

        $parent = Jabatan::create(['nama' => 'Parent', 'kategori' => 'struktural', 'level' => 1]);

        $response = $this->post(route('jabatan.store'), [
            'nama' => 'Child Jabatan',
            'kategori' => 'struktural',
            'parent_id' => $parent->id,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('jabatan', [
            'nama' => 'Child Jabatan',
            'parent_id' => $parent->id,
            'level' => 2, // 1 + 1
        ]);
    }

    public function test_can_filter_jabatan_by_scope()
    {
        Jabatan::create(['nama' => 'Struktural 1', 'kategori' => 'struktural', 'level' => 1]);
        Jabatan::create(['nama' => 'Fungsional 1', 'kategori' => 'fungsional', 'level' => 1]);
        Jabatan::create(['nama' => 'Anggota 1', 'kategori' => 'anggota', 'level' => 1]);

        $this->assertEquals(1, Jabatan::struktural()->count());
        $this->assertEquals(1, Jabatan::fungsional()->count());
        $this->assertEquals(1, Jabatan::anggota()->count());
    }

    public function test_validation_fails_with_invalid_kategori()
    {
        $admin = User::factory()->create();
        $admin->markEmailAsVerified();
        $admin->forceFill([
            'verifikasi' => true,
        ])->save();
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super-admin']);
        $admin->assignRole($role);
        $this->actingAs($admin);

        $response = $this->post(route('jabatan.store'), [
            'nama' => 'Invalid Jabatan',
            'kategori' => 'invalid_category',
            // 'level' => 1,
        ]);

        $response->assertSessionHasErrors('kategori');
    }

    public function test_search_ignores_hierarchy_filter()
    {
        $admin = User::factory()->create();
        $admin->markEmailAsVerified();
        $admin->forceFill(['verifikasi' => true])->save();
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super-admin']);
        $admin->assignRole($role);
        $this->actingAs($admin);

        $parent = Jabatan::create(['nama' => 'Parent Folder', 'kategori' => 'struktural', 'level' => 1]);
        Jabatan::create(['nama' => 'Deep Item', 'kategori' => 'fungsional', 'level' => 2, 'parent_id' => $parent->id]);

        // Search for 'Deep Item' while technically 'viewing' Root
        \Illuminate\Support\Facades\Config::set('inertia.testing.ensure_pages_exist', false);

        $response = $this->get(route('jabatan.index', ['search' => 'Deep']));

        $response->assertInertia(fn ($page) => $page
            ->component('DataMaster/Jabatan/Index')
            ->has('jabatan.data', 1)
            ->where('jabatan.data.0.nama', 'Deep Item')
        );
    }
}
