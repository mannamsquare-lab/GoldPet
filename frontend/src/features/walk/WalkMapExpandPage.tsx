import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { walkService } from '../../services/walkService';
import type { WalkSession } from '../../services/walkService';
import { MainHeader } from '../../components/common/MainHeader';
import { BottomNav } from '../../components/common/BottomNav';
import './WalkMapExpand.css';

const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.9780;

function spotMarkerImage(type: string): string {
    switch (type) {
        case 'PEE': return '/assets/images/walk/marker_pee.png';
        case 'POOP': return '/assets/images/walk/marker_poop.png';
        case 'PHOTO': return '/assets/images/walk/marker_camera.png';
        default: return '/assets/images/walk/marker_pee.png';
    }
}

export const WalkMapExpandPage = () => {
    const navigate = useNavigate();
    const { walkId } = useParams<{ walkId: string }>();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<naver.maps.Map | null>(null);
    const polylineRef = useRef<naver.maps.Polyline | null>(null);
    const [walk, setWalk] = useState<WalkSession | null>(null);
    const [address, setAddress] = useState('위치 확인 중...');
    const [mapLoadFailed, setMapLoadFailed] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    // Load walk data
    useEffect(() => {
        if (!walkId) return;
        walkService.getWalkDetail(Number(walkId))
            .then(setWalk)
            .catch(() => navigate(-1));
    }, [walkId, navigate]);

    // Reverse geocode from start coords
    useEffect(() => {
        if (!walk?.startLatitude || !walk?.startLongitude) return;
        import('../../services/api/client').then(({ default: apiClient }) => {
            apiClient.get(`/maps/reverse-geocode?lat=${walk.startLatitude}&lng=${walk.startLongitude}`)
                .then(res => setAddress(res.data.address))
                .catch(() => {});
        }).catch(() => {});
    }, [walk]);

    // Init map
    useEffect(() => {
        let cancelled = false;
        let pollTimer: ReturnType<typeof setInterval>;

        const initMap = (lat: number, lng: number) => {
            if (!mapRef.current || mapInstanceRef.current) return;
            const el = mapRef.current;
            if (el.clientWidth === 0 || el.clientHeight === 0) {
                setTimeout(() => { if (!cancelled) initMap(lat, lng); }, 300);
                return;
            }
            try {
                const center = new naver.maps.LatLng(lat, lng);
                mapInstanceRef.current = new naver.maps.Map(el, {
                    center,
                    zoom: 15,
                    mapTypeControl: false,
                    zoomControl: false,
                    scaleControl: false,
                    mapDataControl: false,
                });
                setMapReady(true);
                setTimeout(() => {
                    if (cancelled) return;
                    if (!mapInstanceRef.current || (mapRef.current && mapRef.current.querySelectorAll('img').length === 0)) {
                        setMapLoadFailed(true);
                    }
                }, 3000);
            } catch {
                setMapLoadFailed(true);
            }
        };

        const setup = () => {
            if (cancelled) return;
            const lat = walk?.startLatitude ?? DEFAULT_LAT;
            const lng = walk?.startLongitude ?? DEFAULT_LNG;
            setTimeout(() => { if (!cancelled) initMap(lat, lng); }, 100);
        };

        if (window.naver?.maps) {
            setup();
        } else {
            let attempts = 0;
            pollTimer = setInterval(() => {
                attempts++;
                if (window.naver?.maps) {
                    clearInterval(pollTimer);
                    setup();
                } else if (attempts >= 50) {
                    clearInterval(pollTimer);
                    setMapLoadFailed(true);
                }
            }, 200);
        }

        return () => {
            cancelled = true;
            if (pollTimer) clearInterval(pollTimer);
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walk?.startLatitude, walk?.startLongitude]);

    // Draw route polyline once map is ready and walk data loaded
    useEffect(() => {
        if (!mapReady || !mapInstanceRef.current || !walk?.pathPoints?.length) return;
        try {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }
            const path = walk.pathPoints
                .filter(p => p.lat != null && p.lng != null)
                .map(p => new naver.maps.LatLng(p.lat, p.lng));
            if (path.length === 0) return;
            polylineRef.current = new naver.maps.Polyline({
                map: mapInstanceRef.current,
                path,
                strokeColor: '#614108',
                strokeWeight: 4,
                strokeOpacity: 1,
            });
            // Build bounds from path + spots
            const bounds = path.length > 1
                ? new naver.maps.LatLngBounds(path[0], path[0])
                : null;
            if (bounds) path.forEach(p => bounds.extend(p));

            // Pet markers at start and end
            if (path.length > 0) {
                new naver.maps.Marker({
                    map: mapInstanceRef.current,
                    position: path[0],
                    icon: {
                        content: '<div class="walk_map_expand_marker walk_map_expand_marker--start"><span>출발</span></div>',
                        size: new naver.maps.Size(36, 48),
                        anchor: new naver.maps.Point(18, 48),
                    } as unknown as naver.maps.MarkerIcon,
                });
                new naver.maps.Marker({
                    map: mapInstanceRef.current,
                    position: path[path.length - 1],
                    icon: {
                        content: '<div class="walk_map_expand_marker walk_map_expand_marker--end"><span>도착</span></div>',
                        size: new naver.maps.Size(36, 48),
                        anchor: new naver.maps.Point(18, 48),
                    } as unknown as naver.maps.MarkerIcon,
                });
            }

            // Spot markers (PEE, POOP, PHOTO, PROBLEM, OTHER)
            if (walk.spots?.length) {
                walk.spots.forEach(spot => {
                    if (spot.latitude == null || spot.longitude == null) return;
                    const pos = new naver.maps.LatLng(spot.latitude, spot.longitude);
                    if (bounds) bounds.extend(pos);
                    const imgSrc = spotMarkerImage(spot.type ?? 'OTHER');
                    new naver.maps.Marker({
                        map: mapInstanceRef.current!,
                        position: pos,
                        icon: {
                            content: `<img src="${imgSrc}" width="32" height="32" style="display:block;" alt="${spot.type}" />`,
                            size: new naver.maps.Size(32, 32),
                            anchor: new naver.maps.Point(16, 16),
                        } as unknown as naver.maps.MarkerIcon,
                    });
                });
            }

            if (bounds) {
                mapInstanceRef.current.fitBounds(bounds, { top: 80, right: 20, bottom: 80, left: 20 });
            }
        } catch (err) {
            console.error('WalkMapExpand: route drawing failed', err);
        }
    }, [mapReady, walk]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0분';
        const min = Math.round(seconds / 60);
        return `${min}분`;
    };

    const formatCalories = (cal?: number) => {
        if (!cal) return '0';
        return cal.toLocaleString();
    };

    return (
        <div className="walk_map_expand_page">
            <MainHeader variant="back-only" className="intro_header" />

            {/* Date + share row (same as WalkDetailPage) */}
            {walk && (
                <div className="walk_map_expand_date_row">
                    <span className="walk_detail_date">{formatDate(walk.startTime)}</span>
                    <button type="button" className="walk_detail_share_btn" aria-label="공유">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="12" fill="#FFE5FA"/>
                            <path d="M6 13.5V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V13.5" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 15V6M12 6L8.625 9.375M12 6L15.375 9.375" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            )}

            {/* Map */}
            <div className="walk_map_expand_map_container">
                {mapLoadFailed ? (
                    <div className="walk_map_expand_map_error">
                        <p>지도를 불러올 수 없습니다</p>
                        <button type="button" onClick={() => window.location.reload()}>새로고침</button>
                    </div>
                ) : (
                    <div ref={mapRef} className="walk_map_expand_map" />
                )}

                {/* Reduction (collapse) button */}
                <button
                    type="button"
                    className="walk_map_expand_reduce_btn"
                    aria-label="지도 축소"
                    onClick={() => navigate(-1)}
                >
                    <svg width="40" height="40" viewBox="16 8 40 40" fill="none">
                        <rect x="16" y="8" width="40" height="40" rx="8" fill="white"/>
                        <path d="M46 18L39 25M26 38L33 31M39 18V25M33 38V31M26 31H33M46 25H39" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Location label overlay */}
                <div className="walk_map_expand_location_chip">
                    <img src="/assets/images/common/pin_icon.svg" alt="" />
                    <span>{address}</span>
                </div>
            </div>

            {/* Bottom stats overlay */}
            {walk && (
                <div className="walk_map_expand_stats">
                    <div className="walk_map_expand_stat_item">
                        <span className="walk_map_expand_stat_label">거리(km)</span>
                        <span className="walk_map_expand_stat_value">{walk.distance?.toFixed(1) ?? '0.0'}</span>
                    </div>
                    <div className="walk_map_expand_stat_divider" />
                    <div className="walk_map_expand_stat_item">
                        <span className="walk_map_expand_stat_label">시간</span>
                        <span className="walk_map_expand_stat_value">{formatDuration(walk.durationSeconds)}</span>
                    </div>
                    <div className="walk_map_expand_stat_divider" />
                    <div className="walk_map_expand_stat_item">
                        <span className="walk_map_expand_stat_label">칼로리(Kcal)</span>
                        <span className="walk_map_expand_stat_value">{formatCalories(walk.calories)}</span>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

export default WalkMapExpandPage;
