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
        Schema::table('activity_logs', function (Blueprint $table) {
            // Add new columns for enhanced tracking
            $table->string('event')->nullable()->after('action'); // Event type (created, updated, deleted, etc.)
            $table->json('properties')->nullable()->after('user_agent'); // Store old/new values
            $table->uuid('batch_uuid')->nullable()->after('properties'); // Group related activities

            // Polymorphic relation to who caused the action (can be different from user)
            $table->string('causer_type')->nullable()->after('batch_uuid');
            $table->unsignedBigInteger('causer_id')->nullable()->after('causer_type');

            // Add indexes for better performance
            $table->index('event');
            $table->index('batch_uuid');
            $table->index(['causer_type', 'causer_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['event']);
            $table->dropIndex(['batch_uuid']);
            $table->dropIndex(['causer_type', 'causer_id']);
            $table->dropIndex(['created_at']);

            $table->dropColumn([
                'event',
                'properties',
                'batch_uuid',
                'causer_type',
                'causer_id',
            ]);
        });
    }
};
