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
        Schema::create('jabatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->enum('kategori', ['struktural', 'fungsional', 'anggota'])->default('anggota');
            $table->integer('level')->default(99); // 1=Tertinggi (Dirjen), 99=Terendah
            $table->foreignId('parent_id')->nullable()->constrained('jabatan')->nullOnDelete();
            $table->text('keterangan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jabatan');
    }
};
