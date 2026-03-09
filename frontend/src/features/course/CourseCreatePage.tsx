import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  courseService,
  type CreateCourseRequest,
  type CourseSpotDto,
  type CourseSpotType,
  type CourseDifficulty,
} from '../../services/courseService';
import { walkService } from '../../services/walkService';
import './CourseCreatePage.css';

// ── Spot helpers (mirror CourseMap.tsx) ──────────────────────────────────────

const SPOT_TYPES: { type: CourseSpotType; emoji: string; label: string }[] = [
  { type: 'CONVENIENCE_STORE', emoji: '🏪', label: '편의점' },
  { type: 'WATER_FOUNTAIN',   emoji: '💧', label: '음수대' },
  { type: 'RESTROOM',         emoji: '🚻', label: '화장실' },
  { type: 'PET_CAFE',         emoji: '☕', label: '펫카페' },
  { type: 'PARK',             emoji: '🌳', label: '공원' },
  { type: 'DANGER_ZONE',      emoji: '⚠️', label: '위험구역' },
  { type: 'REST_AREA',        emoji: '🪑', label: '쉼터' },
  { type: 'TRASH_CAN',        emoji: '🗑️', label: '쓰레기통' },
  { type: 'PHOTO_SPOT',       emoji: '📷', label: '포토스팟' },
  { type: 'OTHER',            emoji: '📍', label: '기타' },
];

function spotEmoji(type: CourseSpotType): string {
  return SPOT_TYPES.find(s => s.type === type)?.emoji ?? '📍';
}

function spotLabel(type: CourseSpotType): string {
  return SPOT_TYPES.find(s => s.type === type)?.label ?? '기타';
}

// ── Walk spot type → Course spot type mapping ────────────────────────────────

function walkSpotTypeToCourseSpotType(
  walkType: string,
): CourseSpotType | null {
  switch (walkType) {
    case 'PHOTO': return 'PHOTO_SPOT';
    case 'PROBLEM': return 'DANGER_ZONE';
    default: return null; // PEE / POOP not mapped
  }
}

// ── Haversine distance (km) between two [lat,lng] points ─────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcTotalDistance(waypoints: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    total += haversine(waypoints[i - 1][0], waypoints[i - 1][1], waypoints[i][0], waypoints[i][1]);
  }
  return Math.round(total * 100) / 100;
}

// ── Local spot type (before saving) ─────────────────────────────────────────

interface LocalSpot {
  id: string; // temp key
  lat: number;
  lng: number;
  type: CourseSpotType;
  name: string;
  description: string;
}

// ── SpotModal component ───────────────────────────────────────────────────────

interface SpotModalProps {
  onConfirm: (type: CourseSpotType, name: string, description: string) => void;
  onClose: () => void;
}

function SpotModal({ onConfirm, onClose }: SpotModalProps) {
  const [selectedType, setSelectedType] = useState<CourseSpotType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    if (!selectedType) return;
    onConfirm(selectedType, name.trim(), description.trim());
  };

  return (
    <div className="course_create_spot_modal">
      <div className="course_create_spot_modal_backdrop" onClick={onClose} />
      <div className="course_create_spot_modal_content">
        <div className="course_create_spot_modal_handle" />
        <p className="course_create_spot_modal_title">스팟 추가</p>

        <div className="course_create_spot_types">
          {SPOT_TYPES.map(s => (
            <button
              key={s.type}
              className={`course_create_spot_type_btn${selectedType === s.type ? ' selected' : ''}`}
              onClick={() => setSelectedType(s.type)}
              type="button"
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="course_create_spot_modal_fields">
          <input
            className="course_create_input"
            placeholder="이름 (선택)"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
          />
          <input
            className="course_create_input"
            placeholder="설명 (선택)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={200}
          />
        </div>

        <button
          className="course_create_spot_modal_confirm"
          onClick={handleConfirm}
          disabled={!selectedType}
          type="button"
        >
          지도에 추가
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function CourseCreatePage() {
  const navigate = useNavigate();
  const { walkId: walkIdParam } = useParams<{ walkId: string }>();
  const walkId = walkIdParam ? parseInt(walkIdParam, 10) : undefined;
  const isFromWalk = walkId != null && !isNaN(walkId);

  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const waypointMarkersRef = useRef<naver.maps.Marker[]>([]);
  const spotMarkersRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clickListenerRef = useRef<any>(null);
  const mapReadyRef = useRef(false);

  // State
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [spots, setSpots] = useState<LocalSpot[]>([]);
  const [lastTapPos, setLastTapPos] = useState<{ lat: number; lng: number } | null>(null);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('EASY');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [distanceKm, setDistanceKm] = useState(0);

  // ── Fetch walk detail when in from-walk mode ──────────────────────────────

  const { data: walkDetail, isLoading: walkLoading } = useQuery({
    queryKey: ['walkDetail', walkId],
    queryFn: () => walkService.getWalkDetail(walkId!),
    enabled: isFromWalk,
  });

  // Pre-fill from walk data
  useEffect(() => {
    if (!walkDetail) return;

    // Convert pathPoints to waypoints array
    if (walkDetail.pathPoints && walkDetail.pathPoints.length > 0) {
      const pts: [number, number][] = walkDetail.pathPoints.map(p => [p.lat, p.lng]);
      setWaypoints(pts);
      setDistanceKm(walkDetail.distance ?? 0);
    }

    // Pre-fill estimated minutes from duration
    if (walkDetail.durationSeconds) {
      setEstimatedMinutes(String(Math.round(walkDetail.durationSeconds / 60)));
    }

    // Map walk spots to course spots
    if (walkDetail.spots && walkDetail.spots.length > 0) {
      const mappedSpots: LocalSpot[] = walkDetail.spots
        .map((ws, i) => {
          const courseType = walkSpotTypeToCourseSpotType(ws.type);
          if (!courseType) return null;
          return {
            id: `walk-spot-${i}`,
            lat: ws.latitude,
            lng: ws.longitude,
            type: courseType,
            name: ws.note ?? '',
            description: '',
          } satisfies LocalSpot;
        })
        .filter((s): s is LocalSpot => s !== null);
      setSpots(mappedSpots);
    }
  }, [walkDetail]);

  // Recalculate distance when waypoints change (unless pre-filled from walk)
  useEffect(() => {
    if (isFromWalk && walkDetail) return; // keep walk's original distance
    setDistanceKm(calcTotalDistance(waypoints));
  }, [waypoints, isFromWalk, walkDetail]);

  // ── Map initialization ────────────────────────────────────────────────────

  const redrawPolyline = useCallback((pts: [number, number][]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (pts.length < 2) return;

    const path = pts.map(([lat, lng]) => new naver.maps.LatLng(lat, lng));
    polylineRef.current = new naver.maps.Polyline({
      path,
      strokeColor: '#614108',
      strokeWeight: 4,
      strokeOpacity: 0.85,
      map,
    });
  }, []);

  const redrawWaypointMarkers = useCallback((pts: [number, number][]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    for (const m of waypointMarkersRef.current) m.setMap(null);
    waypointMarkersRef.current = [];

    pts.forEach((pt, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === pts.length - 1 && pts.length > 1;
      let content: string;
      if (isFirst) {
        content = '<div style="width:14px;height:14px;border-radius:50%;background:#614108;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>';
      } else if (isLast) {
        content = '<div style="width:14px;height:14px;border-radius:50%;background:#E74C3C;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>';
      } else {
        content = `<div style="width:10px;height:10px;border-radius:50%;background:#c8a96e;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>`;
      }

      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(pt[0], pt[1]),
        icon: {
          content,
          size: new naver.maps.Size(14, 14),
          anchor: new naver.maps.Point(7, 7),
        } as unknown as naver.maps.MarkerIcon,
      });

      // Click marker to remove it (last waypoint only for simplicity)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (naver.maps as any).Event.addListener(marker, 'click', () => {
        setWaypoints(prev => {
          const next = prev.filter((_, i) => i !== idx);
          return next;
        });
      });

      waypointMarkersRef.current.push(marker);
    });
  }, []);

  const addSpotMarker = useCallback((spot: LocalSpot) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const emoji = spotEmoji(spot.type);
    const label = spot.name || spotLabel(spot.type);
    const marker = new naver.maps.Marker({
      map,
      position: new naver.maps.LatLng(spot.lat, spot.lng),
      icon: {
        content: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="width:32px;height:32px;border-radius:50%;background:#fff;border:1.5px solid #e0d5c8;box-shadow:0 1px 4px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-size:16px;">${emoji}</div><div style="background:rgba(0,0,0,0.6);color:#fff;font-size:10px;padding:1px 5px;border-radius:4px;white-space:nowrap;max-width:64px;overflow:hidden;text-overflow:ellipsis;">${label}</div></div>`,
        size: new naver.maps.Size(64, 50),
        anchor: new naver.maps.Point(32, 16),
      } as unknown as naver.maps.MarkerIcon,
    });
    spotMarkersRef.current.set(spot.id, marker);
  }, []);

  const removeSpotMarker = useCallback((spotId: string) => {
    const marker = spotMarkersRef.current.get(spotId);
    if (marker) {
      marker.setMap(null);
      spotMarkersRef.current.delete(spotId);
    }
  }, []);

  // Sync waypoints to map
  useEffect(() => {
    if (!mapReadyRef.current) return;
    redrawPolyline(waypoints);
    redrawWaypointMarkers(waypoints);
  }, [waypoints, redrawPolyline, redrawWaypointMarkers]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const el = mapRef.current;
    if (el.clientWidth === 0 || el.clientHeight === 0) {
      setTimeout(initMap, 300);
      return;
    }

    const defaultCenter = new naver.maps.LatLng(37.5665, 126.9780);
    try {
      mapInstanceRef.current = new naver.maps.Map(el, {
        center: defaultCenter,
        zoom: 15,
        mapTypeControl: false,
        zoomControl: false,
        scaleControl: false,
        mapDataControl: false,
      });

      mapReadyRef.current = true;

      // Click listener — add waypoint or record tap position
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clickListenerRef.current = (naver.maps as any).Event.addListener(
        mapInstanceRef.current,
        'click',
        (e: { coord: naver.maps.LatLng }) => {
          const lat = e.coord.lat();
          const lng = e.coord.lng();
          setLastTapPos({ lat, lng });
          setWaypoints(prev => [...prev, [lat, lng]]);
        },
      );

      // Try to get current position
      const setCenter = (lat: number, lng: number) => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setCenter(new naver.maps.LatLng(lat, lng));
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => setCenter(pos.coords.latitude, pos.coords.longitude),
          () => {},
          { timeout: 5000 },
        );
      }
    } catch (e) {
      console.error('[CourseCreatePage] map init failed:', e);
      setMapLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval>;

    const tryInit = () => {
      if (cancelled) return;
      setTimeout(() => { if (!cancelled) initMap(); }, 100);
    };

    if (window.naver?.maps) {
      tryInit();
    } else {
      let attempts = 0;
      pollTimer = setInterval(() => {
        attempts++;
        if (window.naver?.maps) {
          clearInterval(pollTimer);
          tryInit();
        } else if (attempts >= 50) {
          clearInterval(pollTimer);
          setMapLoadFailed(true);
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (clickListenerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (naver.maps as any).Event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      for (const m of waypointMarkersRef.current) m.setMap(null);
      waypointMarkersRef.current = [];
      for (const m of spotMarkersRef.current.values()) m.setMap(null);
      spotMarkersRef.current.clear();
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      mapReadyRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw pre-filled waypoints once map is ready
  const prefillDrawnRef = useRef(false);
  useEffect(() => {
    if (!mapReadyRef.current || prefillDrawnRef.current) return;
    if (waypoints.length === 0) return;

    prefillDrawnRef.current = true;
    redrawPolyline(waypoints);
    redrawWaypointMarkers(waypoints);

    // Fit bounds
    const map = mapInstanceRef.current;
    if (map) {
      const pts = waypoints.map(([lat, lng]) => new naver.maps.LatLng(lat, lng));
      const bounds = new naver.maps.LatLngBounds(pts[0], pts[0]);
      for (const pt of pts) bounds.extend(pt);
      map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 });
    }
  });

  // Add spot markers when spots change
  const prevSpotsRef = useRef<LocalSpot[]>([]);
  useEffect(() => {
    if (!mapReadyRef.current) return;

    const prevIds = new Set(prevSpotsRef.current.map(s => s.id));
    const currIds = new Set(spots.map(s => s.id));

    // Add new spots
    for (const spot of spots) {
      if (!prevIds.has(spot.id)) addSpotMarker(spot);
    }
    // Remove deleted spots
    for (const prev of prevSpotsRef.current) {
      if (!currIds.has(prev.id)) removeSpotMarker(prev.id);
    }

    prevSpotsRef.current = spots;
  }, [spots, addSpotMarker, removeSpotMarker]);

  // ── Spot modal handling ───────────────────────────────────────────────────

  const handleAddSpot = () => {
    if (!lastTapPos && waypoints.length === 0) {
      alert('먼저 지도를 탭하여 위치를 선택하세요.');
      return;
    }
    setShowSpotModal(true);
  };

  const handleSpotConfirm = (type: CourseSpotType, name: string, description: string) => {
    const pos = lastTapPos ?? (waypoints.length > 0
      ? { lat: waypoints[waypoints.length - 1][0], lng: waypoints[waypoints.length - 1][1] }
      : null);
    if (!pos) return;

    const newSpot: LocalSpot = {
      id: `spot-${Date.now()}`,
      lat: pos.lat,
      lng: pos.lng,
      type,
      name,
      description,
    };
    setSpots(prev => [...prev, newSpot]);
    setShowSpotModal(false);
  };

  const handleRemoveSpot = (spotId: string) => {
    setSpots(prev => prev.filter(s => s.id !== spotId));
  };

  // ── Clear waypoints ───────────────────────────────────────────────────────

  const handleClearWaypoints = () => {
    setWaypoints([]);
    setLastTapPos(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (req: CreateCourseRequest) =>
      isFromWalk
        ? courseService.createCourseFromWalk(walkId!, req)
        : courseService.createCourse(req),
    onSuccess: (data) => {
      navigate(`/courses/${data.id}`);
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('코스 제목을 입력해주세요.');
      return;
    }
    if (waypoints.length < 2) {
      alert('지도에 경로 지점을 2개 이상 추가해주세요.');
      return;
    }

    const spotDtos: CourseSpotDto[] = spots.map((s, i) => ({
      latitude: s.lat,
      longitude: s.lng,
      type: s.type,
      name: s.name || undefined,
      description: s.description || undefined,
      orderIndex: i,
    }));

    const req: CreateCourseRequest = {
      title: title.trim(),
      description: desc.trim() || undefined,
      path: waypoints,
      distanceKm,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 0,
      difficulty,
      spots: spotDtos.length > 0 ? spotDtos : undefined,
      originWalkId: isFromWalk ? walkId : undefined,
    };

    createMutation.mutate(req);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (walkLoading) {
    return (
      <div className="course_create_page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: 14 }}>산책 기록 불러오는 중...</p>
      </div>
    );
  }

  const formattedDistance = distanceKm > 0 ? `${distanceKm.toFixed(2)} km` : '-';
  const formattedMinutes = estimatedMinutes ? `${estimatedMinutes}분` : '-';

  return (
    <div className="course_create_page">
      {/* Header */}
      <div className="course_create_header">
        <button className="course_create_back_btn" onClick={() => navigate(-1)} type="button">
          ‹
        </button>
        <h1>{isFromWalk ? '산책을 코스로 등록' : '새 코스 만들기'}</h1>
      </div>

      {/* Map */}
      <div className="course_create_map_wrap">
        {mapLoadFailed ? (
          <div className="course_create_map_no_load">지도를 불러올 수 없습니다</div>
        ) : (
          <div ref={mapRef} className="course_create_map" />
        )}

        {waypoints.length > 0 && (
          <div className="course_create_waypoint_count">
            {waypoints.length}개 지점
          </div>
        )}

        {!mapLoadFailed && (
          <div className="course_create_map_controls">
            <button
              className="course_create_map_ctrl_btn"
              onClick={handleClearWaypoints}
              type="button"
            >
              경로 초기화
            </button>
          </div>
        )}

        {!mapLoadFailed && waypoints.length === 0 && (
          <div className="course_create_map_hint">지도를 탭하여 경로를 그려보세요</div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="course_create_body">
        {/* Spots section */}
        <div className="course_create_spots_section" style={{ paddingTop: 16 }}>
          <div className="course_create_spots_header">
            <span>스팟 ({spots.length})</span>
            <button
              className="course_create_add_spot_btn"
              onClick={handleAddSpot}
              type="button"
            >
              + 스팟 추가
            </button>
          </div>

          {spots.length > 0 && (
            <div className="course_create_spots_list">
              {spots.map(s => (
                <div key={s.id} className="course_create_spot_item">
                  <div className="course_create_spot_emoji">{spotEmoji(s.type)}</div>
                  <div className="course_create_spot_info">
                    <div className="course_create_spot_name">
                      {s.name || spotLabel(s.type)}
                    </div>
                    <div className="course_create_spot_type">{spotLabel(s.type)}</div>
                  </div>
                  <button
                    className="course_create_spot_remove"
                    onClick={() => handleRemoveSpot(s.id)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="course_create_form">
          {/* Distance / minutes info */}
          <div className="course_create_info_box">
            <div className="course_create_info_item">
              <span>거리</span>
              <span>{formattedDistance}</span>
            </div>
            <div className="course_create_info_item">
              <span>예상 시간</span>
              <span>{formattedMinutes}</span>
            </div>
            <div className="course_create_info_item">
              <span>지점 수</span>
              <span>{waypoints.length}개</span>
            </div>
          </div>

          {/* Title */}
          <div className="course_create_field">
            <label htmlFor="course_title">코스 이름 *</label>
            <input
              id="course_title"
              className="course_create_input"
              placeholder="예: 한강 공원 산책로"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="course_create_field">
            <label htmlFor="course_desc">설명</label>
            <textarea
              id="course_desc"
              className="course_create_input textarea"
              placeholder="코스에 대한 설명을 적어주세요"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
            />
          </div>

          {/* Difficulty */}
          <div className="course_create_field">
            <label>난이도</label>
            <div className="course_create_difficulty_chips">
              {([['EASY', '초급'], ['MODERATE', '중급'], ['HARD', '상급']] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`course_create_difficulty_chip${difficulty === value ? ' selected' : ''}`}
                  onClick={() => setDifficulty(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated minutes */}
          <div className="course_create_field">
            <label htmlFor="course_minutes">예상 소요(분)</label>
            <input
              id="course_minutes"
              className="course_create_input"
              type="number"
              inputMode="numeric"
              placeholder="30"
              min={1}
              max={9999}
              value={estimatedMinutes}
              onChange={e => setEstimatedMinutes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="course_create_submit_wrap">
        <button
          className="course_create_submit_btn"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          type="button"
        >
          {createMutation.isPending ? '등록 중...' : '코스 등록'}
        </button>
        {createMutation.isError && (
          <p style={{ color: '#e74c3c', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
            등록에 실패했습니다. 다시 시도해주세요.
          </p>
        )}
      </div>

      {/* Spot modal */}
      {showSpotModal && (
        <SpotModal
          onConfirm={handleSpotConfirm}
          onClose={() => setShowSpotModal(false)}
        />
      )}
    </div>
  );
}

export default CourseCreatePage;
