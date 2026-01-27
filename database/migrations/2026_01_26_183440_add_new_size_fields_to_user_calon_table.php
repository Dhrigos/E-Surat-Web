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
        Schema::table('user_calon', function (Blueprint $table) {
            $table->string('ukuran_kaos_pdl')->nullable()->after('ukuran_sepatu_olahraga');
            $table->string('ukuran_seragam_tactical')->nullable()->after('ukuran_kaos_pdl');
            $table->string('ukuran_baju_tidur')->nullable()->after('ukuran_seragam_tactical');
            $table->string('ukuran_training_pack')->nullable()->after('ukuran_baju_tidur');
            $table->string('ukuran_baju_renang')->nullable()->after('ukuran_training_pack');
            $table->string('ukuran_sepatu_tactical')->nullable()->after('ukuran_baju_renang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_calon', function (Blueprint $table) {
            $table->dropColumn([
                'ukuran_kaos_pdl',
                'ukuran_seragam_tactical',
                'ukuran_baju_tidur',
                'ukuran_training_pack',
                'ukuran_baju_renang',
                'ukuran_sepatu_tactical',
            ]);
        });
    }
};
