import { useRef, useEffect, useState } from 'react';
import { nativeBridge } from '../bridge/nativeBridge';
import apiClient from '../services/api/client';

const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.9780;

interface UseNaverMapOptions {
    initialLat?: number;
    initialLng?: number;
    zoom?: number;
    withMarker?: boolean;
    withAddressLookup?: boolean;
}

interface UseNaverMapResult {
    mapRef: React.RefObject<HTMLDivElement>;
    mapInstanceRef: React.RefObject<naver.maps.Map | null>;
    markerRef: React.RefObject<naver.maps.Marker | null>;
    address: string;
    mapLoadFailed: boolean;
    moveToLocation: (lat: number, lng: number) => void;
}

export function useNaverMap(options: UseNaverMapOptions = {}): UseNaverMapResult {
    const {
        initialLat = DEFAULT_LAT,
        initialLng = DEFAULT_LNG,
        zoom = 16,
        withMarker = true,
        withAddressLookup = false,
    } = options;

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<naver.maps.Map | null>(null);
    const markerRef = useRef<naver.maps.Marker | null>(null);
    const [address, setAddress] = useState('위치 확인 중...');
    const [mapLoadFailed, setMapLoadFailed] = useState(false);

    const moveToLocation = (lat: number, lng: number) => {
        if (!mapInstanceRef.current) return;
        const pos = new naver.maps.LatLng(lat, lng);
        mapInstanceRef.current.setCenter(pos);
        if (markerRef.current) {
            markerRef.current.setPosition(pos);
        }
        if (withAddressLookup) {
            apiClient.get(`/maps/reverse-geocode?lat=${lat}&lng=${lng}`)
                .then(res => setAddress(res.data.address))
                .catch(() => {});
        }
    };

    useEffect(() => {
        let cancelled = false;
        let pollTimer: ReturnType<typeof setInterval>;

        const initMap = (lat: number, lng: number) => {
            if (!mapRef.current || mapInstanceRef.current) return;
            try {
                const el = mapRef.current;
                // WebView에서 DOM이 완전히 레이아웃되었는지 확인 (zero-size retry)
                if (el.clientWidth === 0 || el.clientHeight === 0) {
                    console.log('[useNaverMap] Container has zero size, retrying in 300ms...');
                    setTimeout(() => { if (!cancelled) initMap(lat, lng); }, 300);
                    return;
                }
                console.log('[useNaverMap] Creating map:', el.clientWidth, 'x', el.clientHeight);
                const center = new naver.maps.LatLng(lat, lng);
                mapInstanceRef.current = new naver.maps.Map(el, {
                    center,
                    zoom,
                    mapTypeControl: false,
                    zoomControl: false,
                    scaleControl: false,
                    mapDataControl: false,
                });
                if (withMarker) {
                    markerRef.current = new naver.maps.Marker({
                        position: center,
                        map: mapInstanceRef.current,
                    });
                }
                console.log('[useNaverMap] Map created successfully');
                // Check 3s after creation that tiles actually loaded
                setTimeout(() => {
                    if (cancelled) return;
                    const container = mapRef.current;
                    if (!mapInstanceRef.current || (container && container.querySelectorAll('img').length === 0)) {
                        console.warn('[useNaverMap] No tiles loaded 3s after creation, marking failed');
                        setMapLoadFailed(true);
                    }
                }, 3000);
            } catch (e) {
                console.error('[useNaverMap] Map creation error:', e);
                setMapLoadFailed(true);
            }
        };

        const setupMap = () => {
            if (cancelled) return;
            initMap(initialLat, initialLng);

            const getLocation = async () => {
                if (nativeBridge.isAvailable()) {
                    try {
                        const loc = await nativeBridge.callMethod('getCurrentLocation') as { latitude: number; longitude: number };
                        if (!cancelled) moveToLocation(loc.latitude, loc.longitude);
                        return;
                    } catch {
                        // fall through to web geolocation
                    }
                }
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => { if (!cancelled) moveToLocation(pos.coords.latitude, pos.coords.longitude); },
                        () => { /* keep default */ },
                        { timeout: 5000 }
                    );
                }
            };
            getLocation();
        };

        console.log('[useNaverMap] naver available:', !!window.naver, 'maps:', !!window.naver?.maps);
        if (window.naver?.maps) {
            // WebView에서 DOM 레이아웃이 완료될 시간을 줌
            setTimeout(() => { if (!cancelled) setupMap(); }, 100);
        } else {
            let attempts = 0;
            pollTimer = setInterval(() => {
                attempts++;
                if (window.naver?.maps) {
                    console.log('[useNaverMap] Maps ready after', attempts, 'attempts');
                    clearInterval(pollTimer);
                    setupMap();
                } else if (attempts >= 50) {
                    console.log('[useNaverMap] Maps NOT available after 50 attempts');
                    clearInterval(pollTimer);
                    setMapLoadFailed(true);
                }
            }, 200);
        }

        return () => {
            cancelled = true;
            if (pollTimer) clearInterval(pollTimer);
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { mapRef, mapInstanceRef, markerRef, address, mapLoadFailed, moveToLocation };
}
