interface WalkRouteThumbnailProps {
  coords?: { lat: number; lng: number }[];
  size?: number;
}

// Convert lat/lng to tile coordinates at given zoom level
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

// Convert lat/lng to pixel position within a tile
function latLngToPixelInTile(
  lat: number,
  lng: number,
  zoom: number,
  tileX: number,
  tileY: number,
  tileSize: number
) {
  const n = Math.pow(2, zoom);
  const px = (((lng + 180) / 360) * n - tileX) * tileSize;
  const latRad = (lat * Math.PI) / 180;
  const py =
    (((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n - tileY) *
    tileSize;
  return { px, py };
}

// Calculate zoom level to fit route in tile
function calcZoom(minLat: number, maxLat: number, minLng: number, maxLng: number): number {
  const latSpread = maxLat - minLat;
  const lngSpread = maxLng - minLng;
  const maxSpread = Math.max(latSpread, lngSpread);
  if (maxSpread > 0.05) return 14;
  if (maxSpread > 0.02) return 15;
  if (maxSpread > 0.005) return 16;
  return 17;
}

const TILE_URL = 'https://map.pstatic.net/nrb/styles/basic/1735880669';

export function WalkRouteThumbnail({ coords, size = 60 }: WalkRouteThumbnailProps) {
  const hasRoute =
    coords &&
    coords.length >= 2 &&
    (() => {
      const lats = coords.map((c) => c.lat);
      const lngs = coords.map((c) => c.lng);
      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      return latSpread > 0.00001 || lngSpread > 0.00001;
    })();

  if (!hasRoute) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: '#EDE8DF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="#614108"
            opacity="0.3"
          />
        </svg>
      </div>
    );
  }

  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const zoom = calcZoom(minLat, maxLat, minLng, maxLng);
  const tile = latLngToTile(centerLat, centerLng, zoom);
  const tileUrl = `${TILE_URL}/${zoom}/${tile.x}/${tile.y}.png`;

  // Map coords to pixel positions within the tile, then scale to our display size
  const tileSize = 256;
  const points = coords.map((c) => {
    const { px, py } = latLngToPixelInTile(c.lat, c.lng, zoom, tile.x, tile.y, tileSize);
    return { x: (px / tileSize) * size, y: (py / tileSize) * size };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const startPt = points[0];
  const endPt = points[points.length - 1];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        background: '#EDE8DF',
      }}
    >
      <img
        src={tileUrl}
        alt=""
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        loading="lazy"
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Route shadow */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Route path */}
        <path
          d={pathData}
          fill="none"
          stroke="#FF5A5F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Start dot */}
        <circle cx={startPt.x} cy={startPt.y} r="3.5" fill="#FF5A5F" stroke="#fff" strokeWidth="1.5" />
        {/* End dot */}
        <circle cx={endPt.x} cy={endPt.y} r="3.5" fill="#FF5A5F" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
