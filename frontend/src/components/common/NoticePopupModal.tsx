import { useState } from 'react';
import type { AppNoticeResponse } from '../../services/noticeService';
import './NoticePopupModal.css';

interface NoticePopupModalProps {
  notices: AppNoticeResponse[];
}

function getTodayKey(id: number): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `notice_dismissed_${id}_${today}`;
}

function isDismissedToday(id: number): boolean {
  return localStorage.getItem(getTodayKey(id)) === 'true';
}

export default function NoticePopupModal({ notices }: NoticePopupModalProps) {
  const popupNotices = notices
    .filter((n) => n.type === 'POPUP_MODAL' && !isDismissedToday(n.id))
    .sort((a, b) => b.priority - a.priority);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissChecked, setDismissChecked] = useState(false);

  if (popupNotices.length === 0 || currentIndex >= popupNotices.length) {
    return null;
  }

  const notice = popupNotices[currentIndex];

  const handleClose = () => {
    if (dismissChecked && notice.isDismissible) {
      localStorage.setItem(getTodayKey(notice.id), 'true');
    }
    setDismissChecked(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleLinkClick = () => {
    if (notice.linkUrl) {
      window.location.href = notice.linkUrl;
    }
  };

  return (
    <div className="notice-popup-overlay">
      <div className="notice-popup-modal">
        {notice.imageUrl && (
          <img
            src={notice.imageUrl}
            alt={notice.title}
            className="notice-popup-image"
            onClick={notice.linkUrl ? handleLinkClick : undefined}
            style={{ cursor: notice.linkUrl ? 'pointer' : 'default' }}
          />
        )}
        <div className="notice-popup-body">
          <h2
            className="notice-popup-title"
            onClick={notice.linkUrl ? handleLinkClick : undefined}
            style={{ cursor: notice.linkUrl ? 'pointer' : 'default' }}
          >
            {notice.title}
          </h2>
          {notice.content && (
            <p className="notice-popup-content">{notice.content}</p>
          )}
        </div>
        <div className="notice-popup-footer">
          {notice.isDismissible && (
            <div className="notice-popup-dismiss-row">
              <input
                type="checkbox"
                id="notice-dismiss-check"
                checked={dismissChecked}
                onChange={(e) => setDismissChecked(e.target.checked)}
              />
              <label htmlFor="notice-dismiss-check" className="notice-popup-dismiss-label">
                오늘 하루 보지 않기
              </label>
            </div>
          )}
          <button className="notice-popup-close-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
