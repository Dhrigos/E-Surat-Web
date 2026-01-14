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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('manager_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('nip')->unique();
            $table->string('nia')->unique()->nullable();
            $table->foreignId('pangkat_id')->constrained('pangkat')->onDelete('restrict');
            $table->foreignId('jabatan_id')->constrained('jabatan')->onDelete('restrict');
            $table->foreignId('status_keanggotaan_id')->nullable()->constrained('status_keanggotaans')->onDelete('restrict');
            $table->date('tanggal_masuk');
            $table->enum('role', ['staff', 'supervisor', 'manager'])->default('staff');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
