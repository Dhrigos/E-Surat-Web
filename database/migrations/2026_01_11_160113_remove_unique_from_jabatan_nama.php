<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('jabatan', function (Blueprint $table) {
            $table->dropUnique(['nama']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Truncate data because restoring unique constraint will fail with duplicates
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('jabatan')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        Schema::table('jabatan', function (Blueprint $table) {
            $table->string('nama')->unique()->change();
        });
    }
};
