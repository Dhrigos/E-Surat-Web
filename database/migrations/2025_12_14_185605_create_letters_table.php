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
            $table->json('signature_positions')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('is_starred')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('reference_letter_id')->nullable()->constrained('letters')->nullOnDelete();
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
