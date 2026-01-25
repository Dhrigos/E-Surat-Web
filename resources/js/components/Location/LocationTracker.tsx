import React, { useEffect, useState, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface LocationTrackerProps {
    updateInterval?: number; // in milliseconds
    sessionId?: number | null;
    autoStart?: boolean;
    onLocationUpdate?: (location: any) => void;
    onError?: (error: string) => void;
}

export default function LocationTracker({
    updateInterval = 30000, // 30 seconds default
    sessionId = null,
    autoStart = true,
    onLocationUpdate,
    onError,
}: LocationTrackerProps) {
    const [isTracking, setIsTracking] = useState(autoStart);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [updateCount, setUpdateCount] = useState(0);

    const {
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        heading,
        error,
        loading,
        timestamp,
        getCurrentPosition,
    } = useGeolocation({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
        watch: isTracking,
    });



    // Refs to hold latest state for the interval closure
    const locationRef = React.useRef({ latitude, longitude, accuracy, altitude, speed, heading });
    const lastSentRef = React.useRef<string | null>(null); // To compare changes

    // Update refs whenever location changes
    useEffect(() => {
        locationRef.current = { latitude, longitude, accuracy, altitude, speed, heading };
    }, [latitude, longitude, accuracy, altitude, speed, heading]);

    const sendLocationToServer = useCallback(async (isManual = false) => {
        const loc = locationRef.current;
        if (!loc.latitude || !loc.longitude) return;

        // Create a signature to check for changes
        const currentSignature = `${loc.latitude.toFixed(6)},${loc.longitude.toFixed(6)},${loc.accuracy}`;

        // If not manual and same as last sent, skip (save bandwidth)
        if (!isManual && lastSentRef.current === currentSignature) return;

        try {
            const response = await axios.post(route('location.store'), {
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: loc.accuracy,
                altitude: loc.altitude,
                speed: loc.speed,
                heading: loc.heading,
                session_id: sessionId,
                metadata: {
                    browser: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    manual: isManual
                },
            });

            setLastUpdate(new Date());
            setUpdateCount((prev) => prev + 1);
            lastSentRef.current = currentSignature;
            onLocationUpdate?.(response.data.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to send location';
            console.error('Location tracking error:', errorMessage);
            onError?.(errorMessage);
        }
    }, [sessionId, onLocationUpdate, onError]);

    // Interval to check and send location every X seconds
    useEffect(() => {
        if (!isTracking) return;

        const intervalId = setInterval(() => {
            // Only auto-send if we have a location
            if (locationRef.current.latitude) {
                sendLocationToServer();
            }
        }, updateInterval);

        return () => clearInterval(intervalId);
    }, [isTracking, updateInterval, sendLocationToServer]);

    // Handle geolocation errors
    useEffect(() => {
        if (error) {
            onError?.(error);
        }
    }, [error, onError]);

    const startTracking = useCallback(() => setIsTracking(true), []);
    const stopTracking = useCallback(() => setIsTracking(false), []);
    const toggleTracking = useCallback(() => setIsTracking((prev) => !prev), []);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Location Tracking
                        </h3>
                        <button
                            onClick={() => sendLocationToServer(true)}
                            className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-200 px-2 py-1 rounded font-medium transition-colors"
                            title="Force send latest location"
                        >
                            Force Update
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isTracking ? (
                            <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Active Monitoring
                            </span>
                        ) : (
                            'Tracking Paused'
                        )}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <div className="p-1 bg-red-100 dark:bg-red-900/40 rounded text-red-600 dark:text-red-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Location Error</p>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {loading && !latitude && (
                <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Acquiring GPS Signal...
                    </p>
                </div>
            )}

            {latitude && longitude && (
                <div className="space-y-4">
                    {/* Primary Coordinates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Latitude</span>
                            <p className="font-mono text-sm md:text-base font-semibold text-zinc-900 dark:text-white">
                                {latitude.toFixed(6)}
                            </p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Longitude</span>
                            <p className="font-mono text-sm md:text-base font-semibold text-zinc-900 dark:text-white">
                                {longitude.toFixed(6)}
                            </p>
                        </div>
                    </div>



                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                            Sent: {updateCount}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
