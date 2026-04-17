// Loose pre-check for UX only. Strict validation lives on the server.
export function extractYoutubeVideoIdLoose(url: string): string | null {
  if (!url || !url.trim()) return null;
  const match = url.match(/[A-Za-z0-9_-]{11}/);
  return match ? match[0] : null;
}

export function isProbablyYoutubeUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const lower = url.toLowerCase();
  return /youtu\.?be/.test(lower) && !!extractYoutubeVideoIdLoose(url);
}
