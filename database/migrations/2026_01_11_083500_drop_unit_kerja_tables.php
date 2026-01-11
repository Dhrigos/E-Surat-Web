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
        Schema::dropIfExists('jabatan_unit_kerja');
        Schema::dropIfExists('unit_kerja');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('unit_kerja', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->text('alamat')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('unit_kerja')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('jabatan_unit_kerja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jabatan_id')->constrained('jabatan')->onDelete('cascade');
            $table->foreignId('unit_kerja_id')->constrained('unit_kerja')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['jabatan_id', 'unit_kerja_id']);
        });
    }
};
