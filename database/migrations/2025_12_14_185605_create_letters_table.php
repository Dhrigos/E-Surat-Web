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
        Schema::create('letters', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->string('priority')->default('normal');
            $table->string('category')->default('internal');
            $table->string('mail_type')->default('official');
            $table->text('description');
            $table->text('content')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status')->default('draft');
            $table->string('approver_position')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letters');
    }
};
