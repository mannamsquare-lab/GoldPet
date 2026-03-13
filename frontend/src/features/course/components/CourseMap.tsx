import { useRef, useEffect, useCallback } from 'react';
import type { CourseSpotResponse } from '../../../services/courseService';
import { spotEmoji, spotLabel } from '../utils/courseHelpers';
import { createSvgPathOverlay } from '../../walk/utils/walkMapUtils';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

interface CourseMapProps {
  path: number[][]; // [[lat, lng], ...]
  spots: CourseSpotResponse[];
}

export function CourseMap({ path, spots }: CourseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<{ setMap: (map: naver.maps.Map | null) => void } | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const initializedRef = useRef(false);

  const drawCourse = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || initializedRef.current) return;
    if (!path.length) return;

    try {
      // Build LatLng points from [[lat, lng], ...]
      const points = path
        .filter((p) => p.length >= 2 && p[0] != null && p[1] != null)
        .map((p) => new naver.maps.LatLng(p[0], p[1]));

      if (points.length === 0) return;

      // Draw polyline
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      polylineRef.current = createSvgPathOverlay(map, points, {
        strokeColor: '#614108',
        strokeWeight: 4,
        strokeOpacity: 0.85,
      });

      // Compute bounds
      const bounds = new naver.maps.LatLngBounds(points[0], points[0]);
      for (const pt of points) bounds.extend(pt);

      // Start marker
      markersRef.current.push(
        new naver.maps.Marker({
          map,
          position: points[0],
          icon: {
            content: '<div style="width:14px;height:14px;border-radius:50%;background:#614108;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
            size: new naver.maps.Size(14, 14),
            anchor: new naver.maps.Point(7, 7),
          } as unknown as naver.maps.MarkerIcon,
        })
      );

      // End marker
      if (points.length > 1) {
        markersRef.current.push(
          new naver.maps.Marker({
            map,
            position: points[points.length - 1],
            icon: {
              content: '<div style="width:14px;height:14px;border-radius:50%;background:#E74C3C;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
              size: new naver.maps.Size(14, 14),
              anchor: new naver.maps.Point(7, 7),
            } as unknown as naver.maps.MarkerIcon,
          })
        );
      }

      // Spot markers
      for (const spot of spots) {
        if (spot.latitude == null || spot.longitude == null) continue;
        const pos = new naver.maps.LatLng(spot.latitude, spot.longitude);
        bounds.extend(pos);
        const emoji = spotEmoji(spot.type);
        const label = escapeHtml(spot.name || spotLabel(spot.type));
        markersRef.current.push(
          new naver.maps.Marker({
            map,
            position: pos,
            icon: {
              content: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><div style="width:32px;height:32px;border-radius:50%;background:#fff;border:1.5px solid #e0d5c8;box-shadow:0 1px 4px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;font-size:16px;">${emoji}</div><div style="background:rgba(0,0,0,0.6);color:#fff;font-size:10px;padding:1px 5px;border-radius:4px;white-space:nowrap;max-width:64px;overflow:hidden;text-overflow:ellipsis;">${label}</div></div>`,
              size: new naver.maps.Size(64, 50),
              anchor: new naver.maps.Point(32, 16),
            } as unknown as naver.maps.MarkerIcon,
          })
        );
      }

      map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 });
      initializedRef.current = true;
    } catch (err) {
      console.error('[CourseMap] draw failed:', err);
    }
  }, [path, spots]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval>;

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const el = mapRef.current;
      if (el.clientWidth === 0 || el.clientHeight === 0) {
        setTimeout(() => { if (!cancelled) initMap(); }, 300);
        return;
      }

      // Determine initial center from path
      const center = path.length > 0
        ? new naver.maps.LatLng(path[0][0], path[0][1])
        : new naver.maps.LatLng(37.5665, 126.9780);

      try {
        mapInstanceRef.current = new naver.maps.Map(el, {
          center,
          zoom: 15,
          mapTypeControl: false,
          zoomControl: false,
          scaleControl: false,
          mapDataControl: false,
        });
        drawCourse();
      } catch (e) {
        console.error('[CourseMap] init failed:', e);
      }
    };

    if (window.naver?.maps) {
      setTimeout(() => { if (!cancelled) initMap(); }, 100);
    } else {
      let attempts = 0;
      pollTimer = setInterval(() => {
        attempts++;
        if (window.naver?.maps) {
          clearInterval(pollTimer);
          initMap();
        } else if (attempts >= 50) {
          clearInterval(pollTimer);
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      for (const m of markersRef.current) m.setMap(null);
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-draw when path/spots change after map is already initialized
  useEffect(() => {
    if (!mapInstanceRef.current || initializedRef.current) return;
    drawCourse();
  }, [drawCourse]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
      aria-label="코스 지도"
    />
  );
}

export default CourseMap;
