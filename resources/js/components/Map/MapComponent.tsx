import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icon for current user
const CurrentUserIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [49, 49],
    className: 'current-user-marker',
});

export interface LocationMarker {
    id: number;
    latitude: number;
    longitude: number;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    accuracy?: number;
    captured_at: string;
}

interface MapComponentProps {
    center?: [number, number];
    zoom?: number;
    markers?: LocationMarker[];
    currentUserId?: number;
    height?: string;
    onMarkerClick?: (marker: LocationMarker) => void;
}

// Component to update map view when markers change
function MapUpdater({ markers }: { markers: LocationMarker[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(
                markers.map((m) => [m.latitude, m.longitude] as [number, number])
            );
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [markers, map]);

    return null;
}

export default function MapComponent({
    center = [-6.2088, 106.8456], // Default: Jakarta
    zoom = 13,
    markers = [],
    currentUserId,
    height = '600px',
    onMarkerClick,
}: MapComponentProps) {
    const mapRef = useRef<L.Map | null>(null);

    return (
        <div className="relative" style={{ height }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg shadow-lg z-0"
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {markers.map((marker) => {
                    const isCurrentUser = marker.user.id === currentUserId;
                    const markerIcon = isCurrentUser ? CurrentUserIcon : DefaultIcon;

                    return (
                        <Marker
                            key={marker.id}
                            position={[marker.latitude, marker.longitude]}
                            icon={markerIcon}
                            eventHandlers={{
                                click: () => onMarkerClick?.(marker),
                            }}
                        >
                            <Popup>
                                <div className="p-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        {marker.user.avatar && (
                                            <img
                                                src={marker.user.avatar}
                                                alt={marker.user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {marker.user.name}
                                                {isCurrentUser && (
                                                    <span className="ml-1 text-xs text-blue-600">
                                                        (You)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(marker.captured_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {marker.accuracy && (
                                        <p className="text-xs text-gray-600">
                                            Accuracy: ±{Math.round(marker.accuracy)}m
                                        </p>
                                    )}
                                </div>
                            </Popup>
                            {marker.accuracy && (
                                <Circle
                                    center={[marker.latitude, marker.longitude]}
                                    radius={marker.accuracy}
                                    pathOptions={{
                                        color: isCurrentUser ? '#2563eb' : '#4b5563',
                                        fillColor: isCurrentUser ? '#3b82f6' : '#6b7280',
                                        fillOpacity: 0.1,
                                        weight: 1
                                    }}
                                />
                            )}
                        </Marker>
                    );
                })}

                {markers.length > 0 && <MapUpdater markers={markers} />}
            </MapContainer>
        </div>
    );
}
