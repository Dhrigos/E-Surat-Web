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
                            className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                            title="Force send latest location"
                        >
                            Force Update
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isTracking ? (
                            <span className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Active
                            </span>
                        ) : (
                            'Initializing...'
                        )}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {loading && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Getting your location...
                    </p>
                </div>
            )}

            {accuracy && accuracy > 500 && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2 items-start">
                    <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</span>
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Akurasi Rendah ({Math.round(accuracy)}m)</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Browser menggunakan lokasi berbasis jaringan/IP. Pastikan Wi-Fi aktif untuk hasil lebih akurat pada laptop/PC.
                        </p>
                    </div>
                </div>
            )}

            {latitude && longitude && (
                <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
                            <p className="font-mono text-gray-900 dark:text-white">
                                {latitude.toFixed(6)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
                            <p className="font-mono text-gray-900 dark:text-white">
                                {longitude.toFixed(6)}
                            </p>
                        </div>
                    </div>

                    {accuracy && (
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                            <p className="font-mono text-gray-900 dark:text-white">
                                ±{Math.round(accuracy)} meters
                            </p>
                        </div>
                    )}

                    {lastUpdate && (
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                            <p className="font-mono text-gray-900 dark:text-white">
                                {lastUpdate.toLocaleTimeString()}
                            </p>
                        </div>
                    )}

                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Updates Sent:</span>
                        <p className="font-mono text-gray-900 dark:text-white">{updateCount}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
