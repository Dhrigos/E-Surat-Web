<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            // Add new foreign key columns
            $table->foreignId('unit_kerja_id')->nullable()->after('foto_profil')->constrained('unit_kerja')->onDelete('set null');
            $table->foreignId('subunit_id')->nullable()->after('unit_kerja_id')->constrained('unit_kerja')->onDelete('set null');
            $table->foreignId('jabatan_id')->nullable()->after('subunit_id')->constrained('jabatan')->onDelete('set null');
            $table->foreignId('status_keanggotaan_id')->nullable()->after('jabatan_id')->constrained('status_keanggotaans')->onDelete('set null');
            $table->foreignId('pangkat_id')->nullable()->after('status_keanggotaan_id')->constrained('pangkat')->onDelete('set null');
        });

        // Drop old string columns in a separate statement
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropColumn([
                'status_keanggotaan',
                'pangkat_golongan',
                'jabatan',
                'unit_kesatuan',
                'subdivisi'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            // Add back old string columns
            $table->string('status_keanggotaan')->nullable();
            $table->string('pangkat_golongan')->nullable();
            $table->string('jabatan')->nullable();
            $table->string('unit_kesatuan')->nullable();
            $table->string('subdivisi')->nullable();
        });

        // Drop foreign key columns
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropForeign(['unit_kerja_id']);
            $table->dropForeign(['subunit_id']);
            $table->dropForeign(['jabatan_id']);
            $table->dropForeign(['status_keanggotaan_id']);
            $table->dropForeign(['pangkat_id']);
            
            $table->dropColumn([
                'unit_kerja_id',
                'subunit_id',
                'jabatan_id',
                'status_keanggotaan_id',
                'pangkat_id'
            ]);
        });
    }
};
