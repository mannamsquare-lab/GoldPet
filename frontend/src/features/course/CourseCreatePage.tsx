import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainHeader } from '../../components/common/MainHeader';
import {
  courseService,
  type CreateCourseRequest,
  type UpdateCourseRequest,
  type CourseSpotDto,
  type CourseSpotType,
  type CourseDifficulty,
} from '../../services/courseService';
import { walkService } from '../../services/walkService';
import { SPOT_TYPES, spotEmoji, spotLabel } from './utils/courseHelpers';
import './CourseCreatePage.css';

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
  serverId?: number;
  lat: number;
  lng: number;
  type: CourseSpotType;
  name: string;
  description: string;
  imageUrl?: string;
}

// ── SpotModal component ───────────────────────────────────────────────────────

interface SpotModalProps {
  onConfirm: (type: CourseSpotType, name: string, description: string) => void;
  onClose: () => void;
  editSpot?: LocalSpot;
}

function SpotModal({ onConfirm, onClose, editSpot }: SpotModalProps) {
  const [selectedType, setSelectedType] = useState<CourseSpotType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editSpot) {
      setSelectedType(editSpot.type);
      setName(editSpot.name);
      setDescription(editSpot.description);
    }
  }, [editSpot]);

  const handleConfirm = () => {
    if (!selectedType) return;
    onConfirm(selectedType, name.trim(), description.trim());
  };

  return (
    <div className="course_create_spot_modal">
      <div className="course_create_spot_modal_backdrop" onClick={onClose} />
      <div className="course_create_spot_modal_content">
        <div className="course_create_spot_modal_handle" />
        <p className="course_create_spot_modal_title">{editSpot ? '스팟 수정' : '스팟 추가'}</p>

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
  const queryClient = useQueryClient();
  const { walkId: walkIdParam, courseId: courseIdParam } = useParams<{ walkId: string; courseId: string }>();
  const walkId = walkIdParam ? parseInt(walkIdParam, 10) : undefined;
  const isFromWalk = walkId != null && !isNaN(walkId);
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : undefined;
  const isEditMode = courseId != null && !isNaN(courseId);

  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const waypointMarkersRef = useRef<naver.maps.Marker[]>([]);
  const spotMarkersRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clickListenerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // State
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [spots, setSpots] = useState<LocalSpot[]>([]);
  const [lastTapPos, setLastTapPos] = useState<{ lat: number; lng: number } | null>(null);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState<LocalSpot | null>(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const isAddingSpotRef = useRef(false);

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

  // ── Fetch course detail when in edit mode ────────────────────────────────

  const { data: courseDetail, isLoading: courseLoading } = useQuery({
    queryKey: ['course', 'detail', courseId],
    queryFn: () => courseService.getCourseDetail(courseId!),
    enabled: isEditMode,
  });

  // Pre-fill from existing course data
  const courseFilledRef = useRef(false);
  useEffect(() => {
    if (!courseDetail || courseFilledRef.current) return;
    courseFilledRef.current = true;

    setTitle(courseDetail.title);
    setDesc(courseDetail.description ?? '');
    setDifficulty(courseDetail.difficulty);
    setEstimatedMinutes(String(courseDetail.estimatedMinutes));
    setDistanceKm(courseDetail.distanceKm);

    if (courseDetail.path && courseDetail.path.length > 0) {
      const pts: [number, number][] = courseDetail.path.map(p => [p[0], p[1]]);
      setWaypoints(pts);
    }

    if (courseDetail.spots && courseDetail.spots.length > 0) {
      const mappedSpots: LocalSpot[] = courseDetail.spots.map((s, i) => ({
        id: `edit-spot-${i}`,
        serverId: s.id,
        lat: s.latitude,
        lng: s.longitude,
        type: s.type as CourseSpotType,
        name: s.name ?? '',
        description: s.description ?? '',
        imageUrl: s.imageUrl ?? undefined,
      }));
      setSpots(mappedSpots);
    }
  }, [courseDetail]);

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
            imageUrl: ws.imageUrl ?? undefined,
          } satisfies LocalSpot;
        })
        .filter((s): s is LocalSpot => s !== null);
      setSpots(mappedSpots);
    }
  }, [walkDetail]);

  // Recalculate distance when waypoints change (unless initial pre-fill)
  const userEditedPathRef = useRef(false);
  useEffect(() => {
    // Skip recalculation until pre-fill is done
    if (isFromWalk && walkDetail && !userEditedPathRef.current) return;
    if (isEditMode && !courseFilledRef.current) return;
    // After pre-fill, skip one more cycle (the waypoints set by pre-fill)
    if (isEditMode && courseFilledRef.current && !userEditedPathRef.current) {
      userEditedPathRef.current = true;
      return;
    }
    if (isFromWalk && !userEditedPathRef.current) {
      userEditedPathRef.current = true;
      return;
    }
    setDistanceKm(calcTotalDistance(waypoints));
  }, [waypoints, isFromWalk, walkDetail, isEditMode]);

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
        draggable: true,
      });

      // Click marker to remove it (last waypoint only for simplicity)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (naver.maps as any).Event.addListener(marker, 'click', () => {
        setWaypoints(prev => {
          const next = prev.filter((_, i) => i !== idx);
          return next;
        });
      });

      // Drag marker to update coordinates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (naver.maps as any).Event.addListener(marker, 'dragend', (e: { coord: naver.maps.LatLng }) => {
        setWaypoints(prev => prev.map((p, i) =>
          i === idx ? [e.coord.lat(), e.coord.lng()] as [number, number] : p
        ));
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
      draggable: true,
    });

    // Drag marker to update spot coordinates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (naver.maps as any).Event.addListener(marker, 'dragend', (e: { coord: naver.maps.LatLng }) => {
      setSpots(prev => prev.map(s =>
        s.id === spot.id ? { ...s, lat: e.coord.lat(), lng: e.coord.lng() } : s
      ));
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

  // Sync waypoints to map + fitBounds once for edit/from-walk modes
  const initialFitDoneRef = useRef(false);
  useEffect(() => {
    if (!mapReady) return;
    redrawPolyline(waypoints);
    redrawWaypointMarkers(waypoints);

    // Fit bounds once when pre-filled waypoints are first drawn
    if (!initialFitDoneRef.current && (isEditMode || isFromWalk) && waypoints.length >= 2) {
      initialFitDoneRef.current = true;
      const map = mapInstanceRef.current;
      if (map) {
        const pts = waypoints.map(([lat, lng]) => new naver.maps.LatLng(lat, lng));
        const bounds = new naver.maps.LatLngBounds(pts[0], pts[0]);
        for (const pt of pts) bounds.extend(pt);
        map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 });
      }
    }
  }, [mapReady, waypoints, redrawPolyline, redrawWaypointMarkers, isEditMode, isFromWalk]);

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

      setMapReady(true);

      // Click listener — add waypoint or open spot modal (one-shot mode)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clickListenerRef.current = (naver.maps as any).Event.addListener(
        mapInstanceRef.current,
        'click',
        (e: { coord: naver.maps.LatLng }) => {
          const lat = e.coord.lat();
          const lng = e.coord.lng();
          setLastTapPos({ lat, lng });

          if (isAddingSpotRef.current) {
            // One-shot spot mode: open modal without adding waypoint
            isAddingSpotRef.current = false;
            setShowSpotModal(true);
          } else {
            setWaypoints(prev => [...prev, [lat, lng]]);
          }
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
      setMapReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add spot markers when spots change
  const prevSpotsRef = useRef<LocalSpot[]>([]);
  useEffect(() => {
    if (!mapReady) return;

    const prevIds = new Set(prevSpotsRef.current.map(s => s.id));
    const currIds = new Set(spots.map(s => s.id));

    // Add new spots
    for (const spot of spots) {
      if (!prevIds.has(spot.id)) addSpotMarker(spot);
    }
    // Update moved spots (same ID, different coordinates)
    for (const spot of spots) {
      if (prevIds.has(spot.id)) {
        const prev = prevSpotsRef.current.find(p => p.id === spot.id);
        if (prev && (prev.lat !== spot.lat || prev.lng !== spot.lng)) {
          removeSpotMarker(spot.id);
          addSpotMarker(spot);
        }
      }
    }
    // Remove deleted spots
    for (const prev of prevSpotsRef.current) {
      if (!currIds.has(prev.id)) removeSpotMarker(prev.id);
    }

    prevSpotsRef.current = spots;
  }, [mapReady, spots, addSpotMarker, removeSpotMarker]);

  // ── Spot modal handling ───────────────────────────────────────────────────

  const handleAddSpot = () => {
    isAddingSpotRef.current = true;
    alert('지도에서 스팟을 추가할 위치를 탭하세요.');
  };

  const handleSpotConfirm = (type: CourseSpotType, name: string, description: string) => {
    if (editingSpot) {
      setSpots(prev => prev.map(s =>
        s.id === editingSpot.id ? { ...s, type, name, description } : s
      ));
      setEditingSpot(null);
      setShowSpotModal(false);
      return;
    }

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
    if (waypoints.length > 0 && !confirm('경로를 초기화하시겠습니까?')) return;
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

  const updateMutation = useMutation({
    mutationFn: (req: UpdateCourseRequest) =>
      courseService.updateCourse(courseId!, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate(`/courses/${courseId}`);
    },
  });

  const activeMutation = isEditMode ? updateMutation : createMutation;

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('코스 제목을 입력해주세요.');
      return;
    }
    if (waypoints.length < 2) {
      alert('지도에 경로 지점을 2개 이상 추가해주세요.');
      return;
    }
    if (!estimatedMinutes || parseInt(estimatedMinutes, 10) <= 0) {
      alert('예상 소요 시간을 입력해주세요.');
      return;
    }
    if (distanceKm <= 0) {
      alert('경로 거리가 0입니다. 경로 지점을 더 넓게 배치해주세요.');
      return;
    }

    const spotDtos: CourseSpotDto[] = spots.map((s, i) => ({
      id: s.serverId || undefined,
      latitude: s.lat,
      longitude: s.lng,
      type: s.type,
      name: s.name || undefined,
      description: s.description || undefined,
      imageUrl: s.imageUrl || undefined,
      orderIndex: i,
    }));

    if (isEditMode) {
      const req: UpdateCourseRequest = {
        title: title.trim(),
        description: desc.trim() || undefined,
        path: waypoints,
        distanceKm,
        estimatedMinutes: parseInt(estimatedMinutes, 10) || 0,
        difficulty,
        spots: spotDtos,
      };
      updateMutation.mutate(req);
    } else {
      const req: CreateCourseRequest = {
        title: title.trim(),
        description: desc.trim() || undefined,
        path: waypoints,
        distanceKm,
        estimatedMinutes: parseInt(estimatedMinutes, 10) || 0,
        difficulty,
        spots: spotDtos,
        originWalkId: isFromWalk ? walkId : undefined,
      };
      createMutation.mutate(req);
    }
  };

  // ── Scroll focused input into view (iOS/Android keyboard) ────────────────
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (walkLoading || courseLoading) {
    return (
      <div className="course_create_page course_create_loading">
        <p className="course_create_loading_text">
          {isEditMode ? '코스 정보 불러오는 중...' : '산책 기록 불러오는 중...'}
        </p>
      </div>
    );
  }

  const formattedDistance = distanceKm > 0 ? `${distanceKm.toFixed(2)} km` : '-';
  const formattedMinutes = estimatedMinutes ? `${estimatedMinutes}분` : '-';

  return (
    <div className="course_create_page">
      {/* Header */}
      <MainHeader variant="back-only" className="intro_header" />

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
          <div className="course_create_map_hint">
            {isEditMode ? '경로가 초기화되었습니다. 지도를 탭하여 새 경로를 그려보세요' : '지도를 탭하여 경로를 그려보세요'}
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="course_create_body">
        {/* Spots section */}
        <div className="course_create_spots_section">
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
                <div
                  key={s.id}
                  className="course_create_spot_item"
                  onClick={() => {
                    setEditingSpot(s);
                    setShowSpotModal(true);
                  }}
                >
                  <div className="course_create_spot_emoji">{spotEmoji(s.type)}</div>
                  <div className="course_create_spot_info">
                    <div className="course_create_spot_name">
                      {s.name || spotLabel(s.type)}
                    </div>
                    <div className="course_create_spot_type">{spotLabel(s.type)}</div>
                  </div>
                  <button
                    className="course_create_spot_remove"
                    onClick={e => { e.stopPropagation(); handleRemoveSpot(s.id); }}
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
              onFocus={handleInputFocus}
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
              onFocus={handleInputFocus}
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
              onFocus={handleInputFocus}
            />
          </div>
        </div>

      </div>

      {/* Submit — fixed outside scrollable body */}
      <div className="course_create_submit_wrap">
        <button
          className="course_create_submit_btn"
          onClick={handleSubmit}
          disabled={activeMutation.isPending}
          type="button"
        >
          {activeMutation.isPending
            ? (isEditMode ? '수정 중...' : '등록 중...')
            : (isEditMode ? '코스 수정' : '코스 등록')}
        </button>
        {activeMutation.isError && (
          <p className="course_create_error_text">
            {isEditMode ? '수정에 실패했습니다. 다시 시도해주세요.' : '등록에 실패했습니다. 다시 시도해주세요.'}
          </p>
        )}
      </div>

      {/* Spot modal */}
      {showSpotModal && (
        <SpotModal
          onConfirm={handleSpotConfirm}
          onClose={() => {
            setShowSpotModal(false);
            setEditingSpot(null);
            isAddingSpotRef.current = false;
          }}
          editSpot={editingSpot ?? undefined}
        />
      )}
    </div>
  );
}

export default CourseCreatePage;
