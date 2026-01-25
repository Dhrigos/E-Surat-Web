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
            $table->string('ukuran_pakaian')->nullable();
            $table->string('ukuran_sepatu')->nullable();
            $table->string('ukuran_topi')->nullable();
            $table->string('ukuran_kaos_olahraga')->nullable();
            $table->string('ukuran_sepatu_olahraga')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_calon', function (Blueprint $table) {
            $table->dropColumn([
                'ukuran_pakaian',
                'ukuran_sepatu',
                'ukuran_topi',
                'ukuran_kaos_olahraga',
                'ukuran_sepatu_olahraga'
            ]);
        });
    }
};
