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
        // Update letters table
        Schema::table('letters', function (Blueprint $table) {
            $table->dropColumn(['approver_position', 'file_path']);
        });

        // Update letter_attachments table
        Schema::table('letter_attachments', function (Blueprint $table) {
            $table->foreignId('letter_id')->constrained('letters')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size');
            $table->string('mime_type');
        });

        // Create letter_approvers table
        Schema::create('letter_approvers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_id')->constrained('letters')->onDelete('cascade');
            $table->string('approver_id'); // Position/Role
            $table->integer('order');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_approvers');

        Schema::table('letter_attachments', function (Blueprint $table) {
            $table->dropForeign(['letter_id']);
            $table->dropColumn(['letter_id', 'file_path', 'file_name', 'file_size', 'mime_type']);
        });

        Schema::table('letters', function (Blueprint $table) {
            $table->string('approver_position')->nullable();
            $table->string('file_path')->nullable();
        });
    }
};
