import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { walkService } from '../../services/walkService';
import type { WalkSession } from '../../services/walkService';
import { MainHeader } from '../../components/common/MainHeader';
import { BottomNav } from '../../components/common/BottomNav';
import './WalkMapExpand.css';

const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.9780;

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
        });
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
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }
        const path = walk.pathPoints.map(p => new naver.maps.LatLng(p.lat, p.lng));
        polylineRef.current = new naver.maps.Polyline({
            map: mapInstanceRef.current,
            path,
            strokeColor: '#614108',
            strokeWeight: 4,
            strokeOpacity: 1,
        });
        // Fit map to route bounds
        if (path.length > 1) {
            const bounds = new naver.maps.LatLngBounds(path[0], path[0]);
            path.forEach(p => bounds.extend(p));
            mapInstanceRef.current.fitBounds(bounds, { top: 80, right: 20, bottom: 80, left: 20 });
        }
        // Pet markers at start and end
        if (path.length > 0) {
            new naver.maps.CustomOverlay({
                map: mapInstanceRef.current,
                position: path[0],
                content: '<div class="walk_map_expand_marker walk_map_expand_marker--start"><span>출발</span></div>',
                anchor: new naver.maps.Point(18, 54),
            });
            new naver.maps.CustomOverlay({
                map: mapInstanceRef.current,
                position: path[path.length - 1],
                content: '<div class="walk_map_expand_marker walk_map_expand_marker--end"><span>도착</span></div>',
                anchor: new naver.maps.Point(18, 54),
            });
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
            {/* Header: back + date */}
            <div className="walk_map_expand_header">
                <button type="button" className="walk_map_expand_back_btn" onClick={() => navigate(-1)}>
                    <img src="/assets/images/layout/header_icon_back.svg" alt="뒤로가기" />
                </button>
                {walk && (
                    <div className="walk_map_expand_header_date">
                        <span>{formatDate(walk.startTime)}</span>
                        <button type="button" className="walk_map_expand_share_btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L12 14M12 2L8 6M12 2L16 6" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 12V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V12" stroke="#614108" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

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
                        <span className="walk_map_expand_stat_value">{formatDuration(walk.endTime && walk.startTime ? Math.round((new Date(walk.endTime).getTime() - new Date(walk.startTime).getTime()) / 1000) : undefined)}</span>
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
