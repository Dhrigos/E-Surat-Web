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
            $table->string('is_bekerja')->default('tidak_bekerja')->after('alamat_domisili_lengkap'); // Or place appropriately
            $table->foreignId('pekerjaan_id')->nullable()->constrained('pekerjaans')->nullOnDelete();
            $table->string('nama_perusahaan')->nullable();
            $table->string('nama_profesi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_calon', function (Blueprint $table) {
            //
        });
    }
};
