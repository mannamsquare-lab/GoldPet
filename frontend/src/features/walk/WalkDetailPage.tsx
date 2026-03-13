import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainHeader } from '../../components/common/MainHeader';
import { BottomNav } from '../../components/common/BottomNav';
import { walkService } from '../../services/walkService';
import type { WalkSpot } from '../../services/walkService';
import { WalkChart, aggregateDaily, aggregateWeekly, aggregateMonthly } from './components/WalkChart';
import type { WalkDataPoint } from './components/WalkChart';
import { useNaverMap } from '../../hooks/useNaverMap';
import './WalkDetail.css';

type Period = 'daily' | 'weekly' | 'monthly';

function spotMarkerImage(type: string): string {
    switch (type) {
        case 'PEE': return '/assets/images/walk/marker_pee.png';
        case 'POOP': return '/assets/images/walk/marker_poop.png';
        case 'PHOTO': return '/assets/images/walk/marker_camera.png';
        default: return '/assets/images/walk/marker_pee.png';
    }
}

function spotTypeLabel(type: string): string {
    switch (type) {
        case 'PEE': return '소변';
        case 'POOP': return '대변';
        case 'PHOTO': return '사진';
        case 'PROBLEM': return '문제';
        default: return '기타';
    }
}

function spotTypeColor(type: string): string {
    switch (type) {
        case 'PEE': return '#4A90D9';
        case 'POOP': return '#8B6914';
        case 'PHOTO': return '#8A497D';
        case 'PROBLEM': return '#D94A4A';
        default: return '#8B8B8B';
    }
}

function formatSpotTimestamp(ts: string): string {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${h}:${min}`;
}

function petCircleMarkerHtml(variant: 'start' | 'end', imageUrl?: string | null): string {
    const imgSrc = imageUrl || '/assets/images/common/pet_none_img.svg';
    return `<div class="walk_pet_circle walk_pet_circle--${variant}"><img src="${imgSrc}" alt="" /></div>`;
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(d: Date): string {
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function formatWeekRange(weekStart: Date): string {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${formatDate(weekStart)} ~ ${String(end.getMonth() + 1).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`;
}

function formatMonth(year: number, month: number): string {
    return `${year}.${String(month).padStart(2, '0')}`;
}

export const WalkDetailPage = () => {
    const { walkId } = useParams<{ walkId: string }>();
    const navigate = useNavigate();

    const [period, setPeriod] = useState<Period>('weekly');
    const [currentDate, setCurrentDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [selectedSpot, setSelectedSpot] = useState<WalkSpot | null>(null);
    const [photoLoaded, setPhotoLoaded] = useState(false);
    const [photoError, setPhotoError] = useState(false);

    // Walk detail (for route map)
    const { data: walkDetail } = useQuery({
        queryKey: ['walk', 'detail', walkId],
        queryFn: () => walkService.getWalkDetail(Number(walkId)),
        enabled: !!walkId,
    });

    // All walk records for chart aggregation
    const { data: allWalks = [] } = useQuery({
        queryKey: ['walk', 'records', 'raw'],
        queryFn: async () => {
            const { default: apiClient } = await import('../../services/api/client');
            const res = await apiClient.get('/walks/my', { params: { size: 2000 } });
            const data = res.data;
            return Array.isArray(data) ? data : (data.content ?? []);
        },
    });

    // Naver Map
    const { mapRef, mapInstanceRef, mapLoadFailed } = useNaverMap({
        zoom: 15,
        withMarker: false,
        withAddressLookup: false,
        skipGeolocation: true,
    });

    // Draw polyline when walk detail + map ready
    const polylineRef = useRef<naver.maps.Polyline | null>(null);
    const polylineDrawn = useRef(false);
    const spotMarkersRef = useRef<naver.maps.Marker[]>([]);
    const listenersRef = useRef<any[]>([]);

    const drawRoute = useCallback(() => {
        if (!mapInstanceRef.current || !walkDetail?.pathPoints?.length || polylineDrawn.current) return;
        try {
            const points = walkDetail.pathPoints
                .filter((p: { lat: number; lng: number }) => p.lat != null && p.lng != null)
                .map((p: { lat: number; lng: number }) => new naver.maps.LatLng(p.lat, p.lng));
            if (points.length === 0) return;
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }
            polylineRef.current = new naver.maps.Polyline({
                path: points,
                strokeColor: '#6B9A2B',
                strokeWeight: 4,
                strokeOpacity: 0.9,
                map: mapInstanceRef.current,
            });
            // Fit bounds (include path + spots)
            const bounds = new naver.maps.LatLngBounds(points[0], points[0]);
            for (const pt of points) bounds.extend(pt);

            // Pet profile markers at start and end
            const petImg = walkDetail.petProfileImageUrls?.[0];
            new naver.maps.Marker({
                map: mapInstanceRef.current,
                position: points[0],
                icon: {
                    content: petCircleMarkerHtml('start', petImg),
                    size: new naver.maps.Size(52, 52),
                    anchor: new naver.maps.Point(26, 26),
                } as unknown as naver.maps.MarkerIcon,
            });
            new naver.maps.Marker({
                map: mapInstanceRef.current,
                position: points[points.length - 1],
                icon: {
                    content: petCircleMarkerHtml('end', petImg),
                    size: new naver.maps.Size(52, 52),
                    anchor: new naver.maps.Point(26, 26),
                } as unknown as naver.maps.MarkerIcon,
            });

            // Draw spot markers with click listeners
            if (walkDetail.spots?.length) {
                walkDetail.spots.forEach((spot: WalkSpot) => {
                    if (spot.latitude == null || spot.longitude == null) return;
                    const pos = new naver.maps.LatLng(spot.latitude, spot.longitude);
                    bounds.extend(pos);
                    const imgSrc = spotMarkerImage(spot.type ?? 'OTHER');
                    const marker = new naver.maps.Marker({
                        map: mapInstanceRef.current!,
                        position: pos,
                        icon: {
                            content: `<img src="${imgSrc}" width="32" height="32" style="display:block;" alt="${spot.type}" />`,
                            size: new naver.maps.Size(32, 32),
                            anchor: new naver.maps.Point(16, 16),
                        } as unknown as naver.maps.MarkerIcon,
                    });
                    spotMarkersRef.current.push(marker);
                    const listener = (naver.maps as any).Event.addListener(marker, 'click', () => {
                        setSelectedSpot(spot);
                        setPhotoLoaded(false);
                        setPhotoError(false);
                        if (mapInstanceRef.current) {
                            (mapInstanceRef.current as any).panTo(pos);
                        }
                    });
                    listenersRef.current.push(listener);
                });
            }

            mapInstanceRef.current.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 });
            polylineDrawn.current = true;
        } catch (err) {
            console.error('WalkDetail: route drawing failed', err);
        }
    }, [mapInstanceRef, walkDetail]);

    useEffect(() => {
        if (!walkDetail?.pathPoints?.length) return;
        const timer = setInterval(() => {
            if (mapInstanceRef.current) {
                clearInterval(timer);
                drawRoute();
            }
        }, 200);
        return () => clearInterval(timer);
    }, [walkDetail, mapInstanceRef, drawRoute]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            listenersRef.current.forEach(l => {
                try { (naver.maps as any).Event.removeListener(l); } catch {}
            });
            listenersRef.current = [];
            spotMarkersRef.current.forEach(m => m.setMap(null));
            spotMarkersRef.current = [];
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }
        };
    }, []);

    // Prevent body scroll when sheet is open
    useEffect(() => {
        if (selectedSpot) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedSpot]);

    // --- Chart data ---
    const chartData: WalkDataPoint[] = (() => {
        if (period === 'daily') return aggregateDaily(allWalks, currentDate);
        if (period === 'weekly') return aggregateWeekly(allWalks, currentWeekStart);
        return aggregateMonthly(allWalks, currentYear, currentMonth);
    })();

    // --- Date navigation ---
    const navLabel = (() => {
        if (period === 'daily') return formatDate(currentDate);
        if (period === 'weekly') return formatWeekRange(currentWeekStart);
        return formatMonth(currentYear, currentMonth);
    })();

    const goBack = () => {
        if (period === 'daily') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 1);
            setCurrentDate(d);
        } else if (period === 'weekly') {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() - 7);
            setCurrentWeekStart(d);
        } else {
            let m = currentMonth - 1;
            let y = currentYear;
            if (m < 1) { m = 12; y--; }
            setCurrentMonth(m);
            setCurrentYear(y);
        }
    };

    const goForward = () => {
        if (period === 'daily') {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 1);
            setCurrentDate(d);
        } else if (period === 'weekly') {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + 7);
            setCurrentWeekStart(d);
        } else {
            let m = currentMonth + 1;
            let y = currentYear;
            if (m > 12) { m = 1; y++; }
            setCurrentMonth(m);
            setCurrentYear(y);
        }
    };

    // --- Summary stats from walkDetail ---
    const distanceKm = walkDetail?.distance ?? 0;
    const calories = walkDetail?.calories ?? 0;
    const gold = Math.round(distanceKm * 10);
    const durationMin = walkDetail?.durationSeconds
        ? Math.round(walkDetail.durationSeconds / 60)
        : 0;

    const detailDate = walkDetail?.startTime
        ? formatDate(new Date(walkDetail.startTime))
        : '';

    const closeSheet = () => setSelectedSpot(null);

    return (
        <div className="walk_detail_page">
            <MainHeader variant="back-only" className="intro_header" />

            <div className="walk_detail_container">
                <div className="walk_detail_body">
                    {/* Map Section */}
                    <div>
                        <div className="walk_detail_map_header">
                            <span className="walk_detail_date">{detailDate}</span>
                            <button type="button" className="walk_detail_share_btn" aria-label="공유">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect width="24" height="24" rx="12" fill="#FFE5FA"/>
                                    <path d="M6 13.5V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V13.5" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 15V6M12 6L8.625 9.375M12 6L15.375 9.375" stroke="#8A497D" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>

                        <div className="walk_detail_map_box">
                            {mapLoadFailed ? (
                                <div className="walk_detail_map_failed">
                                    <p>지도를 불러올 수 없습니다</p>
                                    <button
                                        type="button"
                                        className="walk_detail_reload_btn"
                                        onClick={() => window.location.reload()}
                                    >
                                        새로고침
                                    </button>
                                </div>
                            ) : (
                                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                            )}
                            <button
                                type="button"
                                className="walk_detail_map_expand_btn"
                                aria-label="지도 확대"
                                onClick={() => navigate(`/walk/map-expand/${walkId}`)}
                            >
                                <svg width="40" height="40" viewBox="16 8 40 40" fill="none">
                                    <rect x="16" y="8" width="40" height="40" rx="8" fill="white"/>
                                    <path d="M46 18H39M46 18V25M46 18L39 25M26 38H33M26 38V31M26 38L33 31" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Distance Chart Card */}
                    <div className="walk_detail_data_card">
                        <p className="walk_detail_data_title">산책 거리(km)</p>

                        {/* Period tabs */}
                        <div className="walk_detail_period_tabs">
                            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`walk_detail_period_tab${period === p ? ' active' : ''}`}
                                    onClick={() => setPeriod(p)}
                                >
                                    {p === 'daily' ? '일' : p === 'weekly' ? '주' : '월'}
                                </button>
                            ))}
                        </div>

                        {/* Date navigation */}
                        <div className="walk_detail_date_nav">
                            <button type="button" className="walk_detail_date_nav_btn" onClick={goBack} aria-label="이전">
                                <svg viewBox="0 0 8 12" fill="none">
                                    <path d="M6 2L2 6L6 10" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <span className="walk_detail_date_nav_label">{navLabel}</span>
                            <button type="button" className="walk_detail_date_nav_btn" onClick={goForward} aria-label="다음">
                                <svg viewBox="0 0 8 12" fill="none">
                                    <path d="M2 2L6 6L2 10" stroke="#505050" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        {/* Chart */}
                        <div className="walk_detail_chart_area">
                            {chartData.length === 0 ? (
                                <p className="walk_detail_no_data">이 기간에 산책 기록이 없습니다.</p>
                            ) : (
                                <WalkChart period={period} data={chartData} />
                            )}
                        </div>
                    </div>

                    {/* Summary stats */}
                    {walkDetail && (
                        <div className="walk_detail_stats_grid">
                            <div className="walk_detail_stat_card">
                                <span className="walk_detail_stat_label">산책 거리</span>
                                <span className="walk_detail_stat_value">
                                    {distanceKm.toFixed(1)}
                                    <span className="walk_detail_stat_unit">km</span>
                                </span>
                            </div>
                            <div className="walk_detail_stat_card">
                                <span className="walk_detail_stat_label">소요 시간</span>
                                <span className="walk_detail_stat_value">
                                    {durationMin}
                                    <span className="walk_detail_stat_unit">분</span>
                                </span>
                            </div>
                            <div className="walk_detail_stat_card">
                                <span className="walk_detail_stat_label">소요 칼로리</span>
                                <span className="walk_detail_stat_value">
                                    {calories.toLocaleString()}
                                    <span className="walk_detail_stat_unit">Kcal</span>
                                </span>
                            </div>
                            <div className="walk_detail_stat_card">
                                <span className="walk_detail_stat_label">골드 적립</span>
                                <span className="walk_detail_stat_value">
                                    {gold}
                                    <span className="walk_detail_stat_unit">G</span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Register as course button */}
                    {(walkDetail?.pathPoints?.length ?? 0) > 0 && (
                        <button
                            type="button"
                            onClick={() => navigate(`/courses/create/from-walk/${walkId}`)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '14px 0',
                                marginTop: '16px',
                                background: '#fff',
                                border: '1.5px solid #614108',
                                borderRadius: '12px',
                                color: '#614108',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M3 15C5 15 5 10 8 10C11 10 11 15 14 15C17 15 17 10 17 10" stroke="#614108" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="3" cy="15" r="1.5" fill="#614108"/>
                                <circle cx="17" cy="10" r="1.5" fill="#614108"/>
                            </svg>
                            이 산책을 코스로 등록
                        </button>
                    )}
                </div>
            </div>

            {/* Spot Detail Bottom Sheet */}
            {selectedSpot && (
                <>
                    <div className="walk_spot_sheet_backdrop" onClick={closeSheet} />
                    <div className="walk_spot_sheet">
                        <div className="walk_spot_sheet_handle" />
                        <div className="walk_spot_sheet_header">
                            <div className="walk_spot_sheet_type" style={{ color: spotTypeColor(selectedSpot.type) }}>
                                <span className="walk_spot_sheet_emoji">
                                    {({ PEE: '💧', POOP: '💩', PHOTO: '📷', PROBLEM: '⚠️' } as Record<string, string>)[selectedSpot.type] || '📌'}
                                </span>
                                <span className="walk_spot_sheet_label">{spotTypeLabel(selectedSpot.type)}</span>
                            </div>
                            <button type="button" className="walk_spot_sheet_close" onClick={closeSheet} aria-label="닫기">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="#8B8B8B" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className="walk_spot_sheet_time">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6.5" stroke="#A58A54" strokeWidth="1.2"/>
                                <path d="M8 4.5V8L10.5 10" stroke="#A58A54" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            <span>{formatSpotTimestamp(selectedSpot.timestamp)}</span>
                        </div>
                        {selectedSpot.note && (
                            <div className="walk_spot_sheet_note">
                                <p>{selectedSpot.note}</p>
                            </div>
                        )}
                        {selectedSpot.type === 'PHOTO' && selectedSpot.imageUrl && (
                            <div className="walk_spot_sheet_photo">
                                {!photoLoaded && !photoError && (
                                    <div className="walk_spot_sheet_photo_placeholder">
                                        <span>사진 로딩 중...</span>
                                    </div>
                                )}
                                {photoError && (
                                    <div className="walk_spot_sheet_photo_placeholder">
                                        <span>사진을 불러올 수 없습니다</span>
                                    </div>
                                )}
                                <img
                                    src={selectedSpot.imageUrl}
                                    alt="산책 사진"
                                    style={{ display: photoLoaded && !photoError ? 'block' : 'none' }}
                                    onLoad={() => setPhotoLoaded(true)}
                                    onError={() => setPhotoError(true)}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            <BottomNav />
        </div>
    );
};

export default WalkDetailPage;
