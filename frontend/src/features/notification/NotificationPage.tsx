import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../services/notificationService';
import './NotificationPage.css';

export default function NotificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60) return '방금 전';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}분 전`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}시간 전`;
    if (diff < 1000 * 60 * 60 * 24 * 7) return `${Math.floor(diff / (1000 * 60 * 60 * 24))}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'CHAT': return '💬';
      case 'FRIEND_REQUEST': return '👋';
      case 'COMMUNITY': return '📝';
      case 'WALK': return '🚶';
      case 'BADGE': return '🏅';
      case 'CHALLENGE': return '🎯';
      case 'SYSTEM': return '📢';
      default: return '🔔';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
  };

  const unreadCount = data?.notifications.filter((n) => !n.isRead).length || 0;

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div id="notificationPage">
      {/* Header */}
      <div className="notification_header">
        <button type="button" className="back_btn btn-effect" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1>알림</h1>
        {unreadCount > 0 && (
          <button 
            type="button" 
            className="mark_all_btn btn-effect"
            onClick={() => markAllReadMutation.mutate()}
          >
            모두 읽음
          </button>
        )}
        {unreadCount === 0 && <div style={{ width: 60 }} />}
      </div>

      {/* Notification List */}
      <div className="notification_list">
        {data?.notifications.length === 0 && (
          <div className="empty_state">
            <span className="empty_icon">🔔</span>
            <p>알림이 없습니다.</p>
          </div>
        )}
        
        {data?.notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            className={`notification_item btn-effect ${notification.isRead ? '' : 'unread'}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification_icon">
              {notification.imageUrl ? (
                <img src={notification.imageUrl} alt="" />
              ) : (
                <span>{getTypeIcon(notification.type)}</span>
              )}
            </div>
            <div className="notification_content">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <span className="notification_time">{formatTime(notification.createdAt)}</span>
            </div>
            {!notification.isRead && <div className="unread_dot" />}
          </button>
        ))}
      </div>
    </div>
  );
}
