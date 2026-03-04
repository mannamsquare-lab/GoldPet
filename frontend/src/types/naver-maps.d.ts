declare namespace naver.maps {
    class Map {
        constructor(el: HTMLElement, options?: MapOptions);
        setCenter(latlng: LatLng): void;
        setZoom(zoom: number): void;
        getCenter(): LatLng;
        fitBounds(bounds: LatLngBounds, padding?: { top?: number; right?: number; bottom?: number; left?: number }): void;
        destroy(): void;
    }

    class LatLngBounds {
        constructor(sw: LatLng, ne: LatLng);
        extend(latlng: LatLng): LatLngBounds;
        getCenter(): LatLng;
    }

    interface MapOptions {
        center?: LatLng;
        zoom?: number;
        mapTypeControl?: boolean;
        zoomControl?: boolean;
        scaleControl?: boolean;
        mapDataControl?: boolean;
    }

    class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
    }

    class Marker {
        constructor(options?: MarkerOptions);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng): void;
    }

    interface MarkerOptions {
        position?: LatLng;
        map?: Map;
        icon?: MarkerIcon;
    }

    interface MarkerIcon {
        url?: string;
        size?: Size;
        anchor?: Point;
    }

    class Size {
        constructor(width: number, height: number);
    }

    class Point {
        constructor(x: number, y: number);
    }

    class Polyline {
        constructor(options?: PolylineOptions);
        setMap(map: Map | null): void;
        setPath(path: LatLng[]): void;
        getPath(): LatLng[];
    }

    interface PolylineOptions {
        map?: Map;
        path?: LatLng[];
        strokeColor?: string;
        strokeOpacity?: number;
        strokeWeight?: number;
        strokeStyle?: string;
    }

    class CustomOverlay {
        constructor(options?: CustomOverlayOptions);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng): void;
        setContent(content: string | HTMLElement): void;
    }

    interface CustomOverlayOptions {
        map?: Map;
        position?: LatLng;
        content?: string | HTMLElement;
        anchor?: Point | string;
    }
}

interface Window {
    naver: typeof naver;
}
