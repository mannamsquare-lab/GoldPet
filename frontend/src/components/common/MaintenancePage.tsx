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
        background: '#FFF7E6',
        padding: '24px',
        textAlign: 'center',
      }}>
        <img
          src="/assets/images/common/logo.svg"
          alt="GoldPet"
          style={{ width: '120px', height: '32px', objectFit: 'contain', marginBottom: '32px' }}
        />
        <h1 style={{
          fontFamily: "'Pretendard', sans-serif",
          fontSize: '22px',
          fontWeight: 700,
          color: '#614108',
          margin: '0 0 12px 0',
        }}>
          {maintenance.title}
        </h1>
        {maintenance.content && (
          <p style={{
            fontFamily: "'Pretendard', sans-serif",
            fontSize: '15px',
            color: '#8B6914',
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
          color: '#B89A5A',
        }}>
          잠시 후 다시 시도해주세요
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
