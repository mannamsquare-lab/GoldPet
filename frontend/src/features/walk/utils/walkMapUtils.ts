export function spotMarkerImage(type: string): string {
    switch (type) {
        case 'PEE': return '/assets/images/walk/marker_pee.png';
        case 'POOP': return '/assets/images/walk/marker_poop.png';
        case 'PHOTO': return '/assets/images/walk/marker_camera.png';
        default: return '/assets/images/walk/marker_pee.png';
    }
}

export function spotTypeLabel(type: string): string {
    switch (type) {
        case 'PEE': return '쉬';
        case 'POOP': return '응가';
        case 'PHOTO': return '사진';
        case 'PROBLEM': return '문제';
        default: return '기타';
    }
}

export function spotTypeMarkerIcon(type: string): string {
    return spotMarkerImage(type);
}

export function formatSpotTimestamp(ts: string): string {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${day} ${h}:${min}`;
}

export function petCircleMarkerHtml(variant: 'start' | 'end', imageUrl?: string | null): string {
    const imgSrc = imageUrl || '/assets/images/common/pet_none_img.svg';
    return `<div class="walk_pet_circle walk_pet_circle--${variant}"><img src="${imgSrc}" alt="" /></div>`;
}

/** Create an SVG-based path overlay using OverlayView.
 *  Uses DOM rendering (same as Marker) so the path stays aligned with
 *  markers at all zoom levels. SVG is sized to its bounding box to avoid
 *  Chromium clipping zero-dimension elements. */
export function createSvgPathOverlay(
    map: naver.maps.Map,
    path: naver.maps.LatLng[],
    options: { strokeColor?: string; strokeWeight?: number; strokeOpacity?: number } = {},
): { setMap: (map: naver.maps.Map | null) => void } {
    const color = options.strokeColor || '#6B9A2B';
    const weight = options.strokeWeight || 4;
    const opacity = options.strokeOpacity || 0.9;

    const Ctor = function (this: any) {
        this._path = path;
        this._el = null as HTMLElement | null;
    };
    Ctor.prototype = new (naver.maps as any).OverlayView();
    Ctor.prototype.constructor = Ctor;

    Ctor.prototype.onAdd = function (this: any) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.left = '0';
        el.style.top = '0';
        el.style.pointerEvents = 'none';
        this._el = el;
        this.getPanes().overlayLayer.appendChild(el);
    };

    Ctor.prototype.draw = function (this: any) {
        const proj = this.getProjection();
        if (!proj || !this._path.length || !this._el) return;
        const pxs: { x: number; y: number }[] = [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < this._path.length; i++) {
            const px = proj.fromCoordToOffset(this._path[i]);
            pxs.push(px);
            if (px.x < minX) minX = px.x;
            if (px.y < minY) minY = px.y;
            if (px.x > maxX) maxX = px.x;
            if (px.y > maxY) maxY = px.y;
        }
        const pad = weight + 2;
        const svgW = maxX - minX + pad * 2;
        const svgH = maxY - minY + pad * 2;
        const svgPoints = pxs.map(p => `${p.x - minX + pad},${p.y - minY + pad}`).join(' ');
        this._el.style.left = (minX - pad) + 'px';
        this._el.style.top = (minY - pad) + 'px';
        this._el.innerHTML =
            `<svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg" style="pointer-events:none">` +
            `<polyline points="${svgPoints}" fill="none" stroke="${color}" stroke-width="${weight}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>` +
            `</svg>`;
    };

    Ctor.prototype.onRemove = function (this: any) {
        if (this._el?.parentNode) this._el.parentNode.removeChild(this._el);
        this._el = null;
    };

    const overlay = new (Ctor as any)();
    overlay.setMap(map);
    return overlay;
}

/** Snap a point to the nearest position on a polyline path.
 *  GPS jitter means spot coords differ slightly from the tracked route;
 *  at high zoom this offset becomes visible. Snapping eliminates it. */
export function snapToPath(lat: number, lng: number, path: { lat: number; lng: number }[]): { lat: number; lng: number } {
    if (path.length === 0) return { lat, lng };
    let minDist = Infinity;
    let closest = { lat, lng };
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1];
        const dx = b.lng - a.lng, dy = b.lat - a.lat;
        const lenSq = dx * dx + dy * dy;
        let t = lenSq === 0 ? 0 : ((lng - a.lng) * dx + (lat - a.lat) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projLat = a.lat + t * dy;
        const projLng = a.lng + t * dx;
        const dist = (lat - projLat) ** 2 + (lng - projLng) ** 2;
        if (dist < minDist) {
            minDist = dist;
            closest = { lat: projLat, lng: projLng };
        }
    }
    return closest;
}
