import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { PathOptions, Layer } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface UserLocation {
    province_code: string;
    province: string;
    total: number;
}

interface Props {
    data: UserLocation[];
    totalUsers: number;
}

export default function IndonesiaMap({ data, totalUsers }: Props) {
    const [geoData, setGeoData] = useState<any>(null);

    const indonesiaCenter: [number, number] = [-2.5, 118.0];

    const provinceUserCounts = useMemo(() => new Map(
        data.map(loc => [String(loc.province_code), loc.total])
    ), [data]);

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/indonesia-prov.geojson')
            .then(response => response.json())
            .then(geoData => {
                setGeoData(geoData);
            })
            .catch(error => console.error('Error loading GeoJSON:', error));
    }, []);

    const getIslandGroup = (provinceName: string): string => {
        const name = provinceName.toUpperCase();

        if (name.includes('ACEH') || name.includes('SUMATERA') || name.includes('SUMATRA') ||
            name.includes('RIAU') || name.includes('JAMBI') || name.includes('BENGKULU') ||
            name.includes('LAMPUNG') || name.includes('BANGKA') || name.includes('BELITUNG')) {
            return 'sumatera';
        }

        if (name.includes('JAKARTA') || name.includes('JAWA') || name.includes('JAVA') ||
            name.includes('BANTEN') || name.includes('YOGYAKARTA') || name.includes('BALI')) {
            return 'jawa';
        }

        if (name.includes('KALIMANTAN') || name.includes('BORNEO')) {
            return 'kalimantan';
        }

        if (name.includes('SULAWESI') || name.includes('GORONTALO')) {
            return 'sulawesi';
        }

        if (name.includes('MALUKU')) {
            return 'maluku';
        }

        if (name.includes('PAPUA')) {
            return 'papua';
        }

        if (name.includes('NUSA TENGGARA') || name.includes('NTB') || name.includes('NTT')) {
            return 'nusa';
        }

        return 'other';
    };

    const provinceStyle = (feature: any): PathOptions => {
        const provinceCode = String(feature.properties?.kode || '');
        const provinceName = feature.properties?.Propinsi || feature.properties?.name || '';
        const island = getIslandGroup(provinceName);

        const userCount = provinceUserCounts.get(provinceCode);

        const colors: Record<string, string> = {
            'sumatera': '#6B7280',
            'jawa': '#9CA3AF',
            'kalimantan': '#6B7280',
            'sulawesi': '#9CA3AF',
            'maluku': '#6B7280',
            'papua': '#9CA3AF',
            'nusa': '#6B7280',
            'other': '#9CA3AF',
        };

        if (userCount) {
            return {
                fillColor: '#3B82F6',
                fillOpacity: 0.7,
                color: '#1E40AF',
                weight: 2.5,
                opacity: 1,
            };
        }

        return {
            fillColor: colors[island] || '#9CA3AF',
            fillOpacity: 0.8,
            color: '#374151',
            weight: 1.5,
            opacity: 1,
        };
    };

    const onEachFeature = (feature: any, layer: Layer) => {
        const provinceCode = String(feature.properties?.kode || '');
        const provinceName = feature.properties?.Propinsi || feature.properties?.name || '';
        const userCount = provinceUserCounts.get(provinceCode);

        if (userCount) {
            layer.on({
                mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        fillOpacity: 0.9
                    });
                },
                mouseout: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 2.5,
                        fillOpacity: 0.7
                    });
                }
            });

            layer.bindTooltip('<strong>' + provinceName + '</strong><br/>' + userCount + ' pengguna', {
                sticky: true,
                direction: 'auto',
                offset: [0, 0],
                className: 'custom-tooltip'
            });
        }
    };

    // Define Indonesia boundaries (approximate)
    const indonesiaBounds: [[number, number], [number, number]] = [
        [6, 95],   // Northwest corner (Aceh area)
        [-11, 141] // Southeast corner (Papua area)
    ];

    return (
        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border bg-[#1F2937]">
            <MapContainer
                center={indonesiaCenter}
                zoom={4.9}
                minZoom={4.9}
                maxZoom={4.9}
                maxBounds={indonesiaBounds}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%', backgroundColor: '#1F2937' }}
                className="z-0"
                scrollWheelZoom={false}
                zoomControl={false}
                dragging={true}
                doubleClickZoom={false}
                touchZoom={false}
                boxZoom={false}
                keyboard={false}
            >
                {geoData && (
                    <GeoJSON
                        data={geoData}
                        style={provinceStyle}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapContainer>
        </div>
    );
}
