interface WalkRouteThumbnailProps {
  coords?: { lat: number; lng: number }[];
  size?: number;
}

export function WalkRouteThumbnail({ coords, size = 60 }: WalkRouteThumbnailProps) {
  // Check if coords have meaningful spread (not all same point)
  const hasRoute = coords && coords.length >= 2 && (() => {
    const lats = coords.map(c => c.lat);
    const lngs = coords.map(c => c.lng);
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
          background: '#EFE1C4',
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

  // Normalize lat/lng to 0-100 SVG coordinate range
  const lats = coords.map(c => c.lat);
  const lngs = coords.map(c => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const padding = 8;
  const viewSize = 100;
  const usableSize = viewSize - padding * 2;

  const toSvgX = (lng: number) => padding + ((lng - minLng) / lngRange) * usableSize;
  // SVG y-axis is inverted: higher lat = lower y
  const toSvgY = (lat: number) => padding + ((maxLat - lat) / latRange) * usableSize;

  const pathData = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(c.lng).toFixed(1)} ${toSvgY(c.lat).toFixed(1)}`)
    .join(' ');

  const startPoint = coords[0];
  const endPoint = coords[coords.length - 1];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: '#D9FFA7',
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid #EFE1C4',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Route path */}
        <path
          d={pathData}
          fill="none"
          stroke="#6B9A2B"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Start dot */}
        <circle
          cx={toSvgX(startPoint.lng)}
          cy={toSvgY(startPoint.lat)}
          r="4"
          fill="#614108"
        />
        {/* End dot */}
        <circle
          cx={toSvgX(endPoint.lng)}
          cy={toSvgY(endPoint.lat)}
          r="4"
          fill="#FF5005"
        />
      </svg>
    </div>
  );
}
