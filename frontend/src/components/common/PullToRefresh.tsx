import { useEffect, useRef, useState, useCallback } from 'react';

const THRESHOLD = 60;
const MAX_PULL = 120;

export const PullToRefresh = () => {
    const startY = useRef(0);
    const activeRef = useRef(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [releasing, setReleasing] = useState(false);

    const onTouchStart = useCallback((e: TouchEvent) => {
        if (window.scrollY <= 0 && !releasing) {
            startY.current = e.touches[0].clientY;
            activeRef.current = true;
        }
    }, [releasing]);

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!activeRef.current) return;
        const dy = e.touches[0].clientY - startY.current;
        if (dy > 10 && window.scrollY <= 0) {
            setPullDistance(Math.min(dy * 0.4, MAX_PULL));
        } else if (dy <= 0) {
            activeRef.current = false;
            setPullDistance(0);
        }
    }, []);

    const onTouchEnd = useCallback(() => {
        if (!activeRef.current) return;
        activeRef.current = false;
        if (pullDistance >= THRESHOLD) {
            setReleasing(true);
            setPullDistance(THRESHOLD);
            setTimeout(() => window.location.reload(), 300);
        } else {
            setPullDistance(0);
        }
    }, [pullDistance]);

    useEffect(() => {
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd);
        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        };
    }, [onTouchStart, onTouchMove, onTouchEnd]);

    if (pullDistance <= 0) return null;

    const progress = Math.min(pullDistance / THRESHOLD, 1);
    const pastThreshold = pullDistance >= THRESHOLD;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: Math.max(pullDistance - 20, 0),
            pointerEvents: 'none',
        }}>
            <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: pastThreshold ? '#614108' : '#fff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: releasing ? 'scale(1.1)' : `scale(${0.6 + progress * 0.4})`,
                transition: releasing ? 'transform 0.2s' : 'none',
                animation: releasing ? 'ptr-spin 0.6s linear infinite' : 'none',
            }}>
                <svg
                    width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke={pastThreshold ? '#fff' : '#614108'}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{
                        transform: `rotate(${progress * 360}deg)`,
                        transition: releasing ? 'none' : 'transform 0.05s',
                    }}
                >
                    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                    <path d="M21 3v6h-6" />
                </svg>
            </div>
            <style>{`
                @keyframes ptr-spin {
                    from { transform: rotate(0deg) scale(1.1); }
                    to { transform: rotate(360deg) scale(1.1); }
                }
            `}</style>
        </div>
    );
};
