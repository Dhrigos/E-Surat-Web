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
        Schema::disableForeignKeyConstraints();

        Schema::table('user_details', function (Blueprint $table) {
            $table->dropForeign(['unit_kerja_id']);
            $table->dropForeign(['subunit_id']);
            $table->dropForeign(['pangkat_id']);
            $table->dropForeign(['status_keanggotaan_id']);
            $table->dropColumn(['unit_kerja_id', 'subunit_id', 'pangkat_id', 'status_keanggotaan_id']);
        });

        Schema::table('staff', function (Blueprint $table) {
            // Check if exists first or just try drop.
            // Staff table structure might vary but usually follows user_details
            $table->dropForeign(['unit_kerja_id']);
            $table->dropForeign(['pangkat_id']);
            $table->dropForeign(['status_keanggotaan_id']);
            $table->dropColumn(['unit_kerja_id', 'pangkat_id', 'status_keanggotaan_id']);
        });

        Schema::dropIfExists('jabatan_unit_kerja');
        Schema::dropIfExists('jabatan_status_keanggotaan');

        Schema::dropIfExists('unit_kerjas');
        Schema::dropIfExists('pangkats');
        Schema::dropIfExists('status_keanggotaans');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Irreversible destruction of legacy structure requested.
    }
};
