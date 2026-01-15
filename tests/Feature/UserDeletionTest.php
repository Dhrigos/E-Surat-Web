<?php

use App\Models\User;
use App\Models\Letter;

use App\Models\Jabatan;
use App\Models\JabatanRole;



test('user can be soft deleted provided they have created a letter', function () {
    // Setup
    $user = User::factory()->create();
    
    // Create necessary seed data safely
    if (Jabatan::count() === 0) {
        Jabatan::create(['nama' => 'Test Jabatan', 'is_active' => true]);
    }
    
    // Create a letter created by this user
    $letter = Letter::create([
        'subject' => 'Test Letter',
        'priority' => 'normal',
        'category' => 'internal',
        'mail_type' => 'official',
        'description' => 'Test Description',
        'status' => 'draft',
        'is_starred' => false,
        'created_by' => $user->id,
    ]);

    // Act
    $user->delete();

    // Assert
    $this->assertSoftDeleted('users', [
        'id' => $user->id,
    ]);
    
    // Assert letter still exists
    $this->assertDatabaseHas('letters', [
        'id' => $letter->id,
        'created_by' => $user->id
    ]);
});
