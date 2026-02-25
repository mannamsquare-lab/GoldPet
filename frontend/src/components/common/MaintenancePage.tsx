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
        background: '#FFF7E6',
        textAlign: 'center',
      }}>
        {/* 브랜딩 영역 — 발바닥 아이콘 + 텍스트 + 로고 (위로 올림) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '48px',
          marginTop: '28vh',
        }}>
          <img
            src="/assets/images/splash/logo_background.svg"
            alt=""
            style={{ width: '56px', height: '56px' }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
            <p style={{
              fontFamily: "'Pretendard', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: '#614108',
              letterSpacing: '-0.32px',
              lineHeight: 1.4,
              margin: 0,
            }}>
              펫 라이프 소셜 서비스
            </p>
            <img
              src="/assets/images/common/logo.svg"
              alt="Gold pet"
              style={{ width: '90px', height: '24px', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* 유지보수 안내 문구 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '48px',
          padding: '0 32px',
        }}>
          <h1 style={{
            fontFamily: "'Pretendard', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#614108',
            margin: '0 0 12px 0',
          }}>
            {maintenance.title}
          </h1>
          {maintenance.content && (
            <p style={{
              fontFamily: "'Pretendard', sans-serif",
              fontSize: '14px',
              color: '#8B6914',
              margin: '0 0 20px 0',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {maintenance.content}
            </p>
          )}
          <p style={{
            fontFamily: "'Pretendard', sans-serif",
            fontSize: '13px',
            color: '#B89A5A',
            margin: 0,
          }}>
            이용에 불편을 드려 죄송합니다
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
