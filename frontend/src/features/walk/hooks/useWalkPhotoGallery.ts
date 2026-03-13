import { useState, useRef, useCallback, useEffect } from 'react';
import type { WalkSpot } from '../../../services/walkService';

interface UseWalkPhotoGalleryReturn {
    /** All PHOTO spots filtered from the walk */
    photoSpots: WalkSpot[];
    /** Resolved blob/http URLs for gallery (empty string for failed ones) */
    resolvedUrls: string[];
    /** Whether blob URLs are being resolved */
    isLoading: boolean;
    /** Whether gallery is open */
    galleryOpen: boolean;
    /** Index of the initially displayed photo in the gallery */
    initialIndex: number;
    /** Single resolved URL for bottom sheet preview (for the selected spot) */
    previewUrl: string | null;
    /** Whether preview photo is loading */
    previewLoading: boolean;
    /** Whether preview photo failed to load */
    previewError: boolean;
    /** Open gallery showing all photos, starting from the given spot */
    openGallery: (spot: WalkSpot) => void;
    /** Close gallery and revoke all blob URLs */
    closeGallery: () => void;
    /** Resolve a single photo for bottom sheet preview */
    resolvePreview: (spot: WalkSpot) => void;
    /** Clear preview state (when closing bottom sheet) */
    clearPreview: () => void;
}

async function resolvePhotoUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('http')) return imageUrl;
    const { default: apiClient } = await import('../../../services/api/client');
    const res = await apiClient.get(`/files/${imageUrl}/content`, { responseType: 'blob' });
    return URL.createObjectURL(res.data);
}

function revokeIfBlob(url: string) {
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

export function useWalkPhotoGallery(spots: WalkSpot[] | undefined): UseWalkPhotoGalleryReturn {
    const [resolvedUrls, setResolvedUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    const resolvedUrlsRef = useRef<string[]>([]);
    const previewUrlRef = useRef<string | null>(null);

    const photoSpots = (spots ?? []).filter(
        (s): s is WalkSpot & { imageUrl: string } => s.type === 'PHOTO' && !!s.imageUrl
    );

    const revokeAllGalleryUrls = useCallback(() => {
        resolvedUrlsRef.current.forEach(revokeIfBlob);
        resolvedUrlsRef.current = [];
        setResolvedUrls([]);
    }, []);

    const openGallery = useCallback((spot: WalkSpot) => {
        const idx = photoSpots.findIndex(
            s => s.imageUrl === spot.imageUrl && s.timestamp === spot.timestamp
        );
        setInitialIndex(idx >= 0 ? idx : 0);

        // Revoke previous gallery URLs if any
        revokeAllGalleryUrls();
        setIsLoading(true);
        setGalleryOpen(true);

        Promise.allSettled(photoSpots.map(s => resolvePhotoUrl(s.imageUrl)))
            .then(results => {
                const urls = results.map(r => r.status === 'fulfilled' ? r.value : '');
                resolvedUrlsRef.current = urls;
                setResolvedUrls(urls);
                setIsLoading(false);
            });
    }, [photoSpots, revokeAllGalleryUrls]);

    const closeGallery = useCallback(() => {
        setGalleryOpen(false);
        revokeAllGalleryUrls();
    }, [revokeAllGalleryUrls]);

    const resolvePreview = useCallback((spot: WalkSpot) => {
        if (spot.type !== 'PHOTO' || !spot.imageUrl) return;
        // Clear previous preview
        if (previewUrlRef.current) revokeIfBlob(previewUrlRef.current);
        setPreviewUrl(null);
        setPreviewLoading(true);
        setPreviewError(false);

        resolvePhotoUrl(spot.imageUrl)
            .then(url => {
                previewUrlRef.current = url;
                setPreviewUrl(url);
                setPreviewLoading(false);
            })
            .catch(() => {
                setPreviewLoading(false);
                setPreviewError(true);
            });
    }, []);

    const clearPreview = useCallback(() => {
        if (previewUrlRef.current) revokeIfBlob(previewUrlRef.current);
        previewUrlRef.current = null;
        setPreviewUrl(null);
        setPreviewLoading(false);
        setPreviewError(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            resolvedUrlsRef.current.forEach(revokeIfBlob);
            if (previewUrlRef.current) revokeIfBlob(previewUrlRef.current);
        };
    }, []);

    return {
        photoSpots,
        resolvedUrls,
        isLoading,
        galleryOpen,
        initialIndex,
        previewUrl,
        previewLoading,
        previewError,
        openGallery,
        closeGallery,
        resolvePreview,
        clearPreview,
    };
}
