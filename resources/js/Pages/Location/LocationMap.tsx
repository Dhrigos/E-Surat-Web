import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import MapComponent, { LocationMarker } from '@/components/Map/MapComponent';
import LocationTracker from '@/components/Location/LocationTracker';
import { SharedData } from '@/types';
import Echo from 'laravel-echo';
import DashboardBackground from '@/components/DashboardBackground';

interface LocationMapProps extends SharedData {
    activeUsers: Array<{
        id: number;
        name: string;
        avatar: string | null;
        location: {
            id: number;
            latitude: number;
            longitude: number;
            accuracy: number | null;
            captured_at: string;
        } | null;
    }>;
}

export default function LocationMap({ auth, activeUsers: initialActiveUsers }: LocationMapProps) {
    const [activeUsers, setActiveUsers] = useState(initialActiveUsers);
    const [markers, setMarkers] = useState<LocationMarker[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<LocationMarker | null>(null);

    // Convert active users to markers
    useEffect(() => {
        const newMarkers: LocationMarker[] = activeUsers
            .filter((user) => user.location !== null)
            .map((user) => ({
                id: user.location!.id,
                latitude: parseFloat(user.location!.latitude as any),
                longitude: parseFloat(user.location!.longitude as any),
                accuracy: user.location!.accuracy || undefined,
                captured_at: user.location!.captured_at,
                user: {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar || undefined,
                },
            }));

        setMarkers(newMarkers);
    }, [activeUsers]);

    // Listen for real-time location updates via Echo
    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        // Join the presence channel
        const channel = window.Echo.join('location.online')
            .here((users: any[]) => {
                console.log('Currently online users:', users);
            })
            .joining((user: any) => {
                console.log('User joined:', user);
            })
            .leaving((user: any) => {
                console.log('User left:', user);
                // Remove user's marker when they leave
                setActiveUsers((prev) =>
                    prev.filter((u) => u.id !== user.id)
                );
            })
            .listen('.location.updated', (event: any) => {
                console.log('Location updated:', event);

                // Update the user's location in state
                setActiveUsers((prev) => {
                    const existingUserIndex = prev.findIndex((u) => u.id === event.user_id);

                    if (existingUserIndex >= 0) {
                        // Update existing user
                        const updated = [...prev];
                        updated[existingUserIndex] = {
                            ...updated[existingUserIndex],
                            location: {
                                id: event.id,
                                latitude: event.latitude,
                                longitude: event.longitude,
                                accuracy: event.accuracy,
                                captured_at: event.captured_at,
                            },
                        };
                        return updated;
                    } else {
                        // Add new user
                        return [
                            ...prev,
                            {
                                id: event.user.id,
                                name: event.user.name,
                                avatar: event.user.avatar,
                                location: {
                                    id: event.id,
                                    latitude: event.latitude,
                                    longitude: event.longitude,
                                    accuracy: event.accuracy,
                                    captured_at: event.captured_at,
                                },
                            },
                        ];
                    }
                });
            });

        return () => {
            window.Echo.leave('location.online');
        };
    }, []);

    const handleLocationUpdate = (location: any) => {
        // Update local state immediately for better responsiveness
        setActiveUsers((prev) => {
            const existingUserIndex = prev.findIndex((u) => u.id === auth.user.id);
            if (existingUserIndex >= 0) {
                const updated = [...prev];
                updated[existingUserIndex] = {
                    ...updated[existingUserIndex],
                    location: {
                        ...location,
                        // Ensure types match
                        id: location.id,
                        latitude: parseFloat(location.latitude),
                        longitude: parseFloat(location.longitude),
                        accuracy: location.accuracy,
                        captured_at: location.captured_at || new Date().toISOString(),
                    },
                };
                return updated;
            }
            return prev;
        });
    };

    const handleError = (error: string) => {
        console.error('Location tracking error:', error);
    };

    const handleMarkerClick = (marker: LocationMarker) => {
        setSelectedMarker(marker);
    };

    return (
        <AppLayout>
            <Head title="Location Tracking" />
            <DashboardBackground />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-black border dark:border-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Live Map
                                    </h3>
                                    <MapComponent
                                        markers={markers}
                                        currentUserId={auth.user.id}
                                        height="600px"
                                        onMarkerClick={handleMarkerClick}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Location Tracker */}
                            <LocationTracker
                                updateInterval={5000}
                                autoStart={true}
                                onLocationUpdate={handleLocationUpdate}
                                onError={handleError}
                            />

                            {/* Active Users List */}
                            <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Active Users ({activeUsers.filter((u) => u.location).length})
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {activeUsers
                                        .filter((user) => user.location)
                                        .map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    const marker = markers.find(
                                                        (m) => m.user.id === user.id
                                                    );
                                                    if (marker) {
                                                        handleMarkerClick(marker);
                                                    }
                                                }}
                                            >
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {user.name}
                                                        {user.id === auth.user.id && (
                                                            <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                                                                (You)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {user.location &&
                                                            new Date(
                                                                user.location.captured_at
                                                            ).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <div className="flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                </div>
                                            </div>
                                        ))}

                                    {activeUsers.filter((u) => u.location).length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                            No active users tracking location
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Selected Marker Info */}
                            {selectedMarker && (
                                <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg shadow p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Selected Location
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                User:
                                            </span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {selectedMarker.user.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Coordinates:
                                            </span>
                                            <p className="font-mono text-gray-900 dark:text-white">
                                                {selectedMarker.latitude.toFixed(6)},{' '}
                                                {selectedMarker.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                        {selectedMarker.accuracy && (
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Accuracy:
                                                </span>
                                                <p className="font-mono text-gray-900 dark:text-white">
                                                    ±{Math.round(selectedMarker.accuracy)} meters
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Last Update:
                                            </span>
                                            <p className="font-mono text-gray-900 dark:text-white">
                                                {new Date(
                                                    selectedMarker.captured_at
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
