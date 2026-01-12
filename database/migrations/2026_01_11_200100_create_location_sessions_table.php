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
        Schema::create('location_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Session timestamps
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();

            // Purpose of tracking (e.g., 'delivery', 'field_work', 'attendance')
            $table->string('purpose')->nullable();

            // Additional metadata (JSON for flexibility)
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('started_at');
            $table->index(['user_id', 'started_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_sessions');
    }
};
