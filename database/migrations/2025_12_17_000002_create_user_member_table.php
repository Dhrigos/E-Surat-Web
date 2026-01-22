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
        Schema::create('user_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nia_nrp')->nullable()->unique();
            $table->string('nik')->nullable()->unique();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->text('alamat_domisili_lengkap')->nullable();
            $table->char('province_id', 2)->nullable();
            $table->char('city_id', 4)->nullable();
            $table->char('district_id', 7)->nullable();
            $table->char('village_id', 10)->nullable();
            $table->string('jalan')->nullable();
            $table->string('office_province_id')->nullable();
            $table->string('office_city_id')->nullable();
            $table->string('office_district_id')->nullable();
            $table->string('office_village_id')->nullable();
            $table->string('foto_profil')->nullable();
            $table->foreignId('jabatan_id')->nullable()->constrained('jabatan')->onDelete('set null');
            $table->foreignId('jabatan_role_id')->nullable()->constrained('jabatan_roles')->nullOnDelete();
            $table->foreignId('status_keanggotaan_id')->nullable()->constrained('status_keanggotaans')->onDelete('set null');
            $table->foreignId('pangkat_id')->nullable()->constrained('pangkat')->onDelete('set null');
            $table->foreignId('mako_id')->nullable()->constrained('makos')->nullOnDelete();
            $table->string('scan_ktp')->nullable();
            $table->string('scan_kta')->nullable();
            $table->string('scan_sk')->nullable();
            $table->string('scan_selfie')->nullable();
            $table->decimal('ekyc_score', 5, 4)->nullable();
            $table->string('tanda_tangan')->nullable();
            $table->date('tanggal_pengangkatan')->nullable();
            $table->string('nomor_sk')->nullable();
            $table->string('nomor_kta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_details');
    }
};
