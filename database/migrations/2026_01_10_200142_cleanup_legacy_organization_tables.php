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

            // if (Schema::hasColumn('user_details', 'unit_kerja_id')) {
            //     try {
            //         $table->dropForeign(['unit_kerja_id']);
            //     } catch (\Exception $e) {}
            //     $table->dropColumn('unit_kerja_id');
            // }
            // if (Schema::hasColumn('user_details', 'subunit_id')) {
            //     try {
            //         $table->dropForeign(['subunit_id']);
            //     } catch (\Exception $e) {}
            //     $table->dropColumn('subunit_id');
            // }
            //  if (Schema::hasColumn('user_details', 'pangkat_id')) {
            //     try {
            //         $table->dropForeign(['pangkat_id']);
            //     } catch (\Exception $e) {}
            //     $table->dropColumn('pangkat_id');
            // }
            //  if (Schema::hasColumn('user_details', 'status_keanggotaan_id')) {
            //      try {
            //         $table->dropForeign(['status_keanggotaan_id']);
            //     } catch (\Exception $e) {}
            //     $table->dropColumn('status_keanggotaan_id');
            // }
        });

        Schema::table('staff', function (Blueprint $table) {
             // if (Schema::hasColumn('staff', 'unit_kerja_id')) {
             //    try {
             //        $table->dropForeign(['unit_kerja_id']);
             //    } catch (\Exception $e) {}
             //    $table->dropColumn('unit_kerja_id');
            // }
            // if (Schema::hasColumn('staff', 'pangkat_id')) {
            //     try {
            //         $table->dropForeign(['pangkat_id']);
            //     } catch (\Exception $e) {}
            //     $table->dropColumn('pangkat_id');
            // }
            // if (Schema::hasColumn('staff', 'status_keanggotaan_id')) {
            //     try {
            //         $table->dropForeign(['status_keanggotaan_id']);
            //     } catch (\Exception $e) {}
            //     $table->dropColumn('status_keanggotaan_id');
            // }
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
