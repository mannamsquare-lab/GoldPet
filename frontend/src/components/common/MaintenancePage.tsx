import { useEffect, useState } from 'react';
import { noticeService } from '../../services/noticeService';
import type { AppNoticeResponse } from '../../services/noticeService';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const [maintenance, setMaintenance] = useState<AppNoticeResponse | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const notice = await noticeService.getMaintenanceNotice();
        setMaintenance(notice);
      } catch {
        // API 실패 시 정상 진행
        setMaintenance(null);
      } finally {
        setChecked(true);
      }
    };
    check();

    // 60초마다 재확인 (해제 시 자동 복구)
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!checked) return null;

  if (maintenance) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🔧</div>
        <h1 style={{
          fontFamily: "'Pretendard', sans-serif",
          fontSize: '22px',
          fontWeight: 700,
          color: '#1f2937',
          margin: '0 0 12px 0',
        }}>
          {maintenance.title}
        </h1>
        {maintenance.content && (
          <p style={{
            fontFamily: "'Pretendard', sans-serif",
            fontSize: '15px',
            color: '#6b7280',
            margin: '0 0 32px 0',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {maintenance.content}
          </p>
        )}
        <p style={{
          fontFamily: "'Pretendard', sans-serif",
          fontSize: '13px',
          color: '#9ca3af',
        }}>
          잠시 후 다시 시도해주세요
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
