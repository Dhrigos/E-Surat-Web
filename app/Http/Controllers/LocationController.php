<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function __construct(
        protected LocationService $locationService
    ) {}

    /**
     * Display location tracking map
     */
    public function index()
    {
        $activeUsers = $this->locationService->getActiveUsersWithLocations();

        return Inertia::render('Location/LocationMap', [
            'activeUsers' => $activeUsers,
        ]);
    }

    /**
     * Store a new location
     */
    public function store(StoreLocationRequest $request)
    {
        $location = $this->locationService->recordLocation(
            user: $request->user(),
            latitude: $request->validated('latitude'),
            longitude: $request->validated('longitude'),
            accuracy: $request->validated('accuracy'),
            altitude: $request->validated('altitude'),
            speed: $request->validated('speed'),
            heading: $request->validated('heading'),
            sessionId: $request->validated('session_id'),
            metadata: $request->validated('metadata')
        );

        return response()->json([
            'success' => true,
            'message' => 'Location recorded successfully',
            'data' => $location,
        ], 201);
    }

    /**
     * Get current location for authenticated user
     */
    public function current(Request $request)
    {
        $location = $this->locationService->getCurrentLocation($request->user());

        return response()->json([
            'success' => true,
            'data' => $location,
        ]);
    }

    /**
     * Get location history
     */
    public function history(Request $request)
    {
        $validated = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:500'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'session_id' => ['nullable', 'integer', 'exists:location_sessions,id'],
        ]);

        $locations = $this->locationService->getLocationHistory(
            user: $request->user(),
            limit: $validated['limit'] ?? 100,
            startDate: isset($validated['start_date']) ? new \DateTime($validated['start_date']) : null,
            endDate: isset($validated['end_date']) ? new \DateTime($validated['end_date']) : null,
            sessionId: $validated['session_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'data' => $locations,
        ]);
    }

    /**
     * Start a new tracking session
     */
    public function startSession(Request $request)
    {
        $validated = $request->validate([
            'purpose' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ]);

        $session = $this->locationService->startTrackingSession(
            user: $request->user(),
            purpose: $validated['purpose'] ?? null,
            metadata: $validated['metadata'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Tracking session started',
            'data' => $session,
        ], 201);
    }

    /**
     * End a tracking session
     */
    public function endSession(Request $request, int $sessionId)
    {
        $session = $request->user()->locationSessions()->findOrFail($sessionId);

        $this->locationService->endTrackingSession($session);

        return response()->json([
            'success' => true,
            'message' => 'Tracking session ended',
            'data' => $session->fresh(),
        ]);
    }

    /**
     * Get active tracking session
     */
    public function activeSession(Request $request)
    {
        $session = $this->locationService->getActiveSession($request->user());

        return response()->json([
            'success' => true,
            'data' => $session,
        ]);
    }
}
