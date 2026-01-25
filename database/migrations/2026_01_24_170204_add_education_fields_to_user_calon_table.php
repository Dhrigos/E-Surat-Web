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
            $table->unsignedBigInteger('pendidikan_id')->nullable();
            $table->string('nama_sekolah')->nullable();
            $table->string('nama_prodi')->nullable();
            $table->string('nilai_akhir')->nullable();
            $table->string('status_lulus')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_calon', function (Blueprint $table) {
            $table->dropColumn([
                'pendidikan_id',
                'nama_sekolah',
                'nama_prodi',
                'nilai_akhir',
                'status_lulus'
            ]);
        });
    }
};
