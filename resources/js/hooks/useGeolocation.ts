import { useEffect, useState, useCallback } from 'react';

export interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
    error: string | null;
    loading: boolean;
    timestamp: number | null;
}

export interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    watch?: boolean;
}

export function useGeolocation(options: GeolocationOptions = {}) {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 0,
        watch = false,
    } = options;

    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        speed: null,
        heading: null,
        error: null,
        loading: true,
        timestamp: null,
    });

    const onSuccess = useCallback((position: GeolocationPosition) => {
        setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
            error: null,
            loading: false,
            timestamp: position.timestamp,
        });
    }, []);

    const onError = useCallback((error: GeolocationPositionError) => {
        let errorMessage = 'An unknown error occurred';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please check your device settings.';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again.';
                break;
        }

        setState((prev) => ({
            ...prev,
            error: errorMessage,
            loading: false,
        }));
    }, []);

    // Removed usingHighAccuracy state to force high accuracy always


    const getCurrentPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
                loading: false,
            }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            onSuccess,
            onError,
            {
                enableHighAccuracy: true,
                timeout,
                maximumAge,
            }
        );
    }, [timeout, maximumAge, onSuccess, onError]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
                loading: false,
            }));
            return;
        }

        let watchId: number;

        if (watch) {
            watchId = navigator.geolocation.watchPosition(
                onSuccess,
                onError,
                {
                    enableHighAccuracy: true,
                    timeout,
                    maximumAge,
                }
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        } else {
            getCurrentPosition();
        }
    }, [watch, timeout, maximumAge, onSuccess, onError, getCurrentPosition]);

    return {
        ...state,
        getCurrentPosition,
    };
}
