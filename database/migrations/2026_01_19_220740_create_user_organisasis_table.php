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
        Schema::create('user_organisasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama_organisasi');
            $table->string('posisi');
            $table->date('tanggal_mulai');
            $table->date('tanggal_berakhir')->nullable();
            $table->text('informasi_tambahan')->nullable();
            $table->boolean('is_active')->default(false); // Masih menjadi anggota
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_organisasis');
    }
};
