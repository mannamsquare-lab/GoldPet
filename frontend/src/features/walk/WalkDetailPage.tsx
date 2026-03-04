import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainHeader } from '../../components/common/MainHeader';
import { BottomNav } from '../../components/common/BottomNav';
import { walkService } from '../../services/walkService';
import { WalkChart, aggregateDaily, aggregateWeekly, aggregateMonthly } from './components/WalkChart';
import type { WalkDataPoint } from './components/WalkChart';
import { useNaverMap } from '../../hooks/useNaverMap';
import './WalkDetail.css';

type Period = 'daily' | 'weekly' | 'monthly';

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
            const res = await apiClient.get('/walks/my');
            return Array.isArray(res.data) ? res.data : [];
        },
    });

    // Naver Map
    const { mapRef, mapInstanceRef, mapLoadFailed } = useNaverMap({
        zoom: 15,
        withMarker: false,
        withAddressLookup: false,
    });

    // Draw polyline when walk detail + map ready
    const polylineRef = useRef<naver.maps.Polyline | null>(null);
    const polylineDrawn = useRef(false);

    const drawRoute = useCallback(() => {
        if (!mapInstanceRef.current || !walkDetail?.pathPoints?.length || polylineDrawn.current) return;
        const points = walkDetail.pathPoints.map(
            (p: { lat: number; lng: number }) => new naver.maps.LatLng(p.lat, p.lng),
        );
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
        // Fit bounds
        const bounds = new naver.maps.LatLngBounds(points[0], points[0]);
        for (const pt of points) bounds.extend(pt);
        mapInstanceRef.current.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 });
        polylineDrawn.current = true;
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

    // Cleanup polyline on unmount
    useEffect(() => {
        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }
        };
    }, []);

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
    // durationSeconds comes from raw API but is not in WalkSession type — derive from endTime if available
    const durationMin = (() => {
        if (!walkDetail?.startTime || !walkDetail?.endTime) return 0;
        const ms = new Date(walkDetail.endTime).getTime() - new Date(walkDetail.startTime).getTime();
        return Math.round(ms / 60000);
    })();

    const detailDate = walkDetail?.startTime
        ? formatDate(new Date(walkDetail.startTime))
        : '';

    return (
        <div id="wrap" className="gp-layout-page">
            <MainHeader variant="back-only" />

            <div className="walk_detail_container">
                <div className="walk_detail_body">
                    {/* Map Section */}
                    <div>
                        <div className="walk_detail_map_header">
                            <span className="walk_detail_date">{detailDate}</span>
                            <button type="button" className="walk_detail_share_btn" aria-label="공유">
                                <svg viewBox="0 0 12 12" fill="none" stroke="#8A497D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 1L11 3L9 5" />
                                    <path d="M11 3H4.5C3.1 3 2 4.1 2 5.5V11" />
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
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M10 2H14V6" stroke="#614108" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 14H2V10" stroke="#614108" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 2L9 7" stroke="#614108" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 14L7 9" stroke="#614108" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default WalkDetailPage;
