import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { nativeBridge } from '../../bridge/nativeBridge';

const COLOR_EFE1C4 = '#EFE1C4';
const COLOR_FFF7E6 = '#FFF7E6';

// Matches the TypeBLayout route group in App.tsx
const isTypeBRoute = (pathname: string): boolean => {
  // Exact match routes (sub-routes are standalone with different layouts)
  if (['/home', '/friend-find', '/friend-list', '/chat', '/profile', '/settings'].includes(pathname)) {
    return true;
  }
  // Prefix match routes (all sub-routes are also in TypeBLayout)
  if (['/walk', '/places', '/gold'].some(p => pathname.startsWith(p))) {
    return true;
  }
  // /community prefix, except /community/write (standalone)
  if (pathname.startsWith('/community') && pathname !== '/community/write') {
    return true;
  }
  return false;
};

export const SystemBarColorSync = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const color = isTypeBRoute(pathname) ? COLOR_EFE1C4 : COLOR_FFF7E6;
    nativeBridge.setSystemBarColors(color, color);
  }, [pathname]);

  return null;
};
