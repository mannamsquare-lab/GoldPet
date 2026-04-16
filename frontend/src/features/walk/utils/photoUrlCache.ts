type CacheEntry = { url: string; createdAt: number };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string>>();

const TTL_MS = 5 * 60 * 1000;
// iOS WKWebView에서 blob URL이 수십 개 쌓이면 스와이프 중 먹통/크래시가 발생.
// Map의 삽입 순서 = LRU 순서로 활용하여 상한 초과 시 oldest부터 revoke.
const MAX_ENTRIES = 20;

function isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt >= TTL_MS;
}

function dropEntry(key: string, entry: CacheEntry) {
    try {
        URL.revokeObjectURL(entry.url);
    } catch {
        /* noop */
    }
    cache.delete(key);
}

function touch(key: string, entry: CacheEntry) {
    cache.delete(key);
    cache.set(key, entry);
}

function evictIfOverflow() {
    while (cache.size > MAX_ENTRIES) {
        const oldest = cache.keys().next();
        if (oldest.done) break;
        const oldestKey = oldest.value;
        const oldestEntry = cache.get(oldestKey);
        if (oldestEntry) dropEntry(oldestKey, oldestEntry);
        else cache.delete(oldestKey);
    }
}

export async function resolvePhotoUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('http')) return imageUrl;
    const entry = cache.get(imageUrl);
    if (entry) {
        if (!isExpired(entry)) {
            touch(imageUrl, entry);
            return entry.url;
        }
        dropEntry(imageUrl, entry);
    }
    const pending = inflight.get(imageUrl);
    if (pending) return pending;

    const promise = (async () => {
        try {
            const { default: apiClient } = await import('../../../services/api/client');
            const res = await apiClient.get(`/files/${imageUrl}/content`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            cache.set(imageUrl, { url, createdAt: Date.now() });
            evictIfOverflow();
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
    const entry = cache.get(imageUrl);
    if (!entry) return undefined;
    if (isExpired(entry)) {
        dropEntry(imageUrl, entry);
        return undefined;
    }
    touch(imageUrl, entry);
    return entry.url;
}

export function revokeOutsideWindow(keepKeys: Set<string>): void {
    for (const [key, entry] of cache) {
        if (!keepKeys.has(key)) {
            dropEntry(key, entry);
        }
    }
}
