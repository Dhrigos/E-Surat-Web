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
        Schema::create('user_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // GPS Coordinates
            $table->decimal('latitude', 10, 8); // -90 to 90
            $table->decimal('longitude', 11, 8); // -180 to 180

            // GPS Metadata
            $table->decimal('accuracy', 10, 2)->nullable(); // meters
            $table->decimal('altitude', 10, 2)->nullable(); // meters
            $table->decimal('speed', 10, 2)->nullable(); // m/s
            $table->decimal('heading', 6, 2)->nullable(); // degrees (0-360)

            // Session tracking
            $table->foreignId('location_session_id')->nullable()->constrained()->nullOnDelete();

            // Additional metadata (JSON for flexibility)
            $table->json('metadata')->nullable();

            // Timestamp when location was captured (may differ from created_at)
            $table->timestamp('captured_at')->useCurrent();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('user_id');
            $table->index('captured_at');
            $table->index('location_session_id');
            $table->index(['user_id', 'captured_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_locations');
    }
};
