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
        Schema::create('user_calon', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Basic personal information
            $table->string('nik')->nullable()->unique();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            
            // Extended personal information
            $table->foreignId('suku_id')->nullable()->constrained('sukus')->onDelete('set null');
            $table->foreignId('bangsa_id')->nullable()->constrained('bangsas')->onDelete('set null');
            $table->foreignId('agama_id')->nullable()->constrained('agamas')->onDelete('set null');
            $table->foreignId('status_pernikahan_id')->nullable()->constrained('pernikahans')->onDelete('set null');
            $table->string('nama_ibu_kandung')->nullable();
            
            // Physical attributes
            $table->foreignId('golongan_darah_id')->nullable()->constrained('goldars')->onDelete('set null');
            $table->integer('tinggi_badan')->nullable();
            $table->integer('berat_badan')->nullable();
            $table->string('warna_kulit')->nullable();
            $table->string('warna_rambut')->nullable();
            $table->string('bentuk_rambut')->nullable();
            
            // Address information
            $table->text('alamat_domisili_lengkap')->nullable();
            $table->char('province_id', 2)->nullable();
            $table->char('city_id', 4)->nullable();
            $table->char('district_id', 7)->nullable();
            $table->char('village_id', 10)->nullable();
            $table->string('jalan')->nullable();
            
            // Photo
            $table->string('foto_profil')->nullable();
            
            // Supporting documents (consolidated from incremental migration)
            $table->string('doc_surat_lamaran')->nullable();
            $table->string('doc_ktp')->nullable();
            $table->string('doc_kk')->nullable();
            $table->string('doc_sk_lurah')->nullable();
            $table->string('doc_skck')->nullable();
            $table->string('doc_ijazah')->nullable();
            $table->string('doc_sk_sehat')->nullable();
            $table->string('doc_drh')->nullable();
            $table->string('doc_latsarmil')->nullable();
            $table->string('doc_izin_instansi')->nullable();
            $table->string('doc_izin_ortu')->nullable();
            $table->string('tanda_tangan')->nullable();
            
            // eKYC
            $table->string('scan_selfie')->nullable();
            $table->decimal('ekyc_score', 5, 4)->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_calon');
    }
};
