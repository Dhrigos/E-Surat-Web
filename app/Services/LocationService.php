<?php

namespace App\Services;

use App\Events\LocationUpdated;
use App\Models\Location;
use App\Models\LocationSession;
use App\Models\User;

class LocationService
{
    /**
     * Record a new location for a user
     */
    public function recordLocation(
        User $user,
        float $latitude,
        float $longitude,
        ?float $accuracy = null,
        ?float $altitude = null,
        ?float $speed = null,
        ?float $heading = null,
        ?int $sessionId = null,
        ?array $metadata = null
    ): Location {
        $location = Location::create([
            'user_id' => $user->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'accuracy' => $accuracy,
            'altitude' => $altitude,
            'speed' => $speed,
            'heading' => $heading,
            'location_session_id' => $sessionId,
            'metadata' => $metadata,
            'captured_at' => now(),
        ]);

        // Broadcast the location update
        broadcast(new LocationUpdated($location))->toOthers();

        return $location;
    }

    /**
     * Get current location for a user
     */
    public function getCurrentLocation(User $user): ?Location
    {
        return Location::where('user_id', $user->id)
            ->latest('captured_at')
            ->first();
    }

    /**
     * Get location history for a user
     */
    public function getLocationHistory(
        User $user,
        ?int $limit = 100,
        ?\DateTime $startDate = null,
        ?\DateTime $endDate = null,
        ?int $sessionId = null
    ) {
        $query = Location::where('user_id', $user->id)
            ->with('session');

        if ($startDate) {
            $query->where('captured_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('captured_at', '<=', $endDate);
        }

        if ($sessionId) {
            $query->where('location_session_id', $sessionId);
        }

        return $query->latest('captured_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Start a new tracking session
     */
    public function startTrackingSession(User $user, ?string $purpose = null, ?array $metadata = null): LocationSession
    {
        return LocationSession::create([
            'user_id' => $user->id,
            'started_at' => now(),
            'purpose' => $purpose,
            'metadata' => $metadata,
        ]);
    }

    /**
     * End a tracking session
     */
    public function endTrackingSession(LocationSession $session): LocationSession
    {
        $session->end();

        return $session;
    }

    /**
     * Get active session for a user
     */
    public function getActiveSession(User $user): ?LocationSession
    {
        return LocationSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->latest('started_at')
            ->first();
    }

    /**
     * Calculate distance between two coordinates in kilometers
     */
    public function calculateDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371; // km

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos($latFrom) * cos($latTo) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Get all currently active users with their latest locations
     */
    public function getActiveUsersWithLocations(int $minutesThreshold = 30)
    {
        return User::whereHas('locations', function ($query) use ($minutesThreshold) {
            $query->where('captured_at', '>=', now()->subMinutes($minutesThreshold));
        })
            ->with(['currentLocation'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar,
                    'location' => $user->currentLocation,
                ];
            });
    }
}
