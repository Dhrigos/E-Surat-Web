<?php

use App\Models\User;
use App\Models\LetterTemplate;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $role = Role::firstOrCreate(['name' => 'super-admin']);
    $user = User::factory()->verified()->create();
    $user->assignRole($role);
    $this->actingAs($user);
});

test('can list letter templates', function () {
    $response = $this->get(route('letter-templates.index'));
    $response->assertStatus(200);
});

test('can create letter template', function () {
    $response = $this->post(route('letter-templates.store'), [
        'name' => 'Template Surat Dinas',
        'type' => 'dinas',
        'content' => '<p>Isi surat...</p>',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('letter_templates', ['name' => 'Template Surat Dinas']);
});
