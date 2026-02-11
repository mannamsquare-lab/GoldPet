declare namespace naver.maps {
    class Map {
        constructor(el: HTMLElement, options?: MapOptions);
        setCenter(latlng: LatLng): void;
        setZoom(zoom: number): void;
        getCenter(): LatLng;
        destroy(): void;
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
}

interface Window {
    naver: typeof naver;
}
