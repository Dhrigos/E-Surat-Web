<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete unused roles (keep only: user, admin, super-admin)
        if (Schema::hasTable('roles')) {
            DB::table('roles')->whereNotIn('name', ['user', 'admin', 'super-admin'])->delete();
        }

        // Drop permission-related tables
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('permissions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reverse - permissions system removed
    }
};
