const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export async function resolvePhotoUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('http')) return imageUrl;
    const cached = cache.get(imageUrl);
    if (cached) return cached;
    const pending = inflight.get(imageUrl);
    if (pending) return pending;

    const promise = (async () => {
        try {
            const { default: apiClient } = await import('../../../services/api/client');
            const res = await apiClient.get(`/files/${imageUrl}/content`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            cache.set(imageUrl, url);
            return url;
        } finally {
            inflight.delete(imageUrl);
        }
    })();
    inflight.set(imageUrl, promise);
    return promise;
}

export function getCachedPhotoUrl(imageUrl: string): string | undefined {
    if (imageUrl.startsWith('http')) return imageUrl;
    return cache.get(imageUrl);
}
