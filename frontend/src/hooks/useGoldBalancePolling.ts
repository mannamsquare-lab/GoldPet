/**
 * useGoldBalancePolling
 *
 * ETag / If-None-Match 기반 골드 잔액 폴링 훅.
 *
 * 동작:
 * - intervalMs(기본 10 s)마다 GET /api/v1/gold/balance 호출
 * - 직전 ETag를 If-None-Match 헤더에 포함
 * - 200: ETag 갱신 + queryClient.invalidateQueries(['gold','balance']) → useQuery 자동 리페치
 * - 304: 변경 없음 → invalidateQueries 미호출 (short-circuit)
 *
 * Acceptance (단위 테스트에서 검증):
 * (a) 매 poll에 직전 ETag로 If-None-Match present
 * (b) 304 → invalidateQueries 미호출
 * (c) 200 → invalidateQueries 호출
 * (d) polling 간격 = 명시값(기본 10 s)
 */
import { useEffect, useRef } from 'react';
import { goldService } from '../services/goldService';
import { queryClient } from '../lib/queryClient';

export const GOLD_BALANCE_POLL_INTERVAL_MS = 10_000;

export function useGoldBalancePolling(intervalMs = GOLD_BALANCE_POLL_INTERVAL_MS): void {
  const etagRef = useRef<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const result = await goldService.getBalanceWithETag(etagRef.current);

        if (result.status === 200) {
          if (result.etag) {
            etagRef.current = result.etag;
          }
          queryClient.invalidateQueries({ queryKey: ['gold', 'balance'] });
        }
        // 304: short-circuit — 변경 없으므로 invalidate 하지 않음
      } catch {
        // 폴링 오류는 무시 (네트워크 단절 등 일시적 상황)
      }
    };

    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
