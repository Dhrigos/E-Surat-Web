import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import MapComponent, { LocationMarker } from '@/components/Map/MapComponent';
import LocationTracker from '@/components/Location/LocationTracker';
import { SharedData } from '@/types';
import Echo from 'laravel-echo';
import DashboardBackground from '@/components/DashboardBackground';
import { Badge } from '@/components/ui/badge';
import { Map, Navigation, Users, Clock, Radio, X } from 'lucide-react';

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
        <AppLayout breadcrumbs={[]}>
            <Head title="Live Location" />

            <div className="p-3 md:p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
                    {/* Map Section */}
                    <div className="lg:col-span-2 h-full flex flex-col">
                        <div className="bg-card dark:bg-[#18181b] border border-border dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex-1 relative">
                            <div className="hidden md:block absolute top-4 right-4 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-600 dark:text-zinc-400">
                                        <Map className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Live Map</h3>
                                        <p className="text-xs text-muted-foreground">Real-time tracking</p>
                                    </div>
                                </div>
                            </div>

                            <MapComponent
                                markers={markers}
                                currentUserId={auth.user.id}
                                height="100%"
                                onMarkerClick={handleMarkerClick}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 h-full flex flex-col">
                        {/* Location Tracker */}
                        <div className="bg-card dark:bg-[#18181b] border border-border dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                            <LocationTracker
                                updateInterval={5000}
                                autoStart={true}
                                onLocationUpdate={handleLocationUpdate}
                                onError={handleError}
                            />
                        </div>

                        {/* Active Users List */}
                        <div className="bg-card dark:bg-[#18181b] border border-border dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <h3 className="font-semibold text-foreground">Active Users</h3>
                                </div>
                                <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800">
                                    {activeUsers.filter((u) => u.location).length} Online
                                </Badge>
                            </div>

                            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {activeUsers
                                    .filter((user) => user.location)
                                    .map((user) => (
                                        <div
                                            key={user.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border ${selectedMarker?.user.id === user.id
                                                ? 'bg-zinc-500/10 border-zinc-500/20 shadow-sm'
                                                : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                                                }`}
                                            onClick={() => {
                                                const marker = markers.find(
                                                    (m) => m.user.id === user.id
                                                );
                                                if (marker) {
                                                    handleMarkerClick(marker);
                                                }
                                            }}
                                        >
                                            <div className="relative">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-500 to-gray-600 flex items-center justify-center text-white font-bold border-2 border-white dark:border-zinc-900 shadow-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full">
                                                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {user.name}
                                                    </p>
                                                    {user.id === auth.user.id && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                                                            You
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {user.location && new Date(user.location.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                {activeUsers.filter((u) => u.location).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3">
                                            <Radio className="w-6 h-6 opacity-50" />
                                        </div>
                                        <p className="text-sm">No active users</p>
                                        <p className="text-xs opacity-70">Waiting for location signals...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Marker Info */}
                        {selectedMarker && (
                            <div className="bg-card dark:bg-[#18181b] border border-border dark:border-zinc-800 rounded-2xl p-4 shadow-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
                                <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="w-4 h-4 text-zinc-500" />
                                        <h3 className="font-semibold text-foreground text-sm">Selected Detail</h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedMarker(null)}
                                        className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">User</span>
                                        <span className="font-medium text-foreground">{selectedMarker.user.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Coordinates</span>
                                        <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                            {selectedMarker.latitude.toFixed(6)}, {selectedMarker.longitude.toFixed(6)}
                                        </span>
                                    </div>
                                    {selectedMarker.accuracy && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Accuracy</span>
                                            <span className="text-xs text-emerald-600 dark:text-emerald-500 font-medium flex items-center gap-1">
                                                <Radio className="w-3 h-3" />
                                                ±{Math.round(selectedMarker.accuracy)} m
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
