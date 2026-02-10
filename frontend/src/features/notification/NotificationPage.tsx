
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../services/notificationService';
import './NotificationPage.css';

const TABS = [
  { id: 'ALL', label: '전체' },
  { id: 'FRIEND', label: '친구찾기' },
  { id: 'CHAT', label: '채팅' },
  { id: 'WALK', label: '산책' },
  { id: 'COMMUNITY', label: '커뮤니티' },
  { id: 'NOTICE', label: '공지' },
  { id: 'EVENT', label: '이벤트' },
];

const NotificationPage = () => {
    const navigate = useNavigate();
    // const { showAlert } = useAlert(); // showConfirm removed, showAlert unused for now but kept in case
    const [activeTab, setActiveTab] = useState('ALL');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, [activeTab]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const { notifications: data } = await notificationService.getNotifications(activeTab);
            setNotifications(data);
        } catch {
            // showAlert('알림을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleNotificationClick = async (item: Notification) => {
        if (!item.isRead) {
            await notificationService.markAsRead(item.id);
            setNotifications(prev =>
                prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
            );
        }
        if (item.targetType && item.targetId) {
            switch (item.targetType) {
                case 'CHAT_ROOM': navigate(`/chat/${item.targetId}`); break;
                case 'POST': navigate(`/community/${item.targetId}`); break;
                case 'MATCH': navigate('/friend-list'); break;
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    // handleDelete removed as it was unused and referenced showAlert which I'm commenting out usage for now code cleanliness
    /*
    const handleDelete = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch {
            // showAlert('알림 삭제에 실패했습니다.');
        }
    };
    */

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    };

    return (
        <div id="notificationContainer">
            {/* Header */}
            <div className="notification_header_bar">
                <div className="header_left">
                    <button type="button" className="back_btn" onClick={handleBack}>
                        <img src="/assets/images/layout/header_icon_back.svg" alt="뒤로가기" />
                    </button>
                    <h2>알림</h2>
                </div>
                <button type="button" className="mark_all_btn" onClick={handleMarkAllAsRead}>
                    전체 읽음
                </button>
            </div>

            {/* Tabs */}
            <div className="notification_tab">
                <ul>
                    {TABS.map(tab => (
                        <li key={tab.id}>
                            <button
                                type="button"
                                className={activeTab === tab.id ? 'active' : ''}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* List */}
            <div className="notification_list">
                {loading ? (
                    <div className="loading">로딩 중...</div>
                ) : notifications.length === 0 ? (
                    <div className="empty_state">
                        <img src="/assets/images/common/comment_icon03.svg" alt="" />
                        <p>새로운 알림이 없습니다.</p>
                    </div>
                ) : (
                    <ul>
                        {notifications.map(item => (
                            <li key={item.id} className={`notification_item${item.isRead ? '' : ' unread'}`} onClick={() => handleNotificationClick(item)}>
                                <div className="notification_icon">
                                    <span>
                                        {item.type === 'MATCH' && '💕'}
                                        {item.type === 'LIKE' && '❤️'}
                                        {item.type === 'MESSAGE' && '💬'}
                                        {item.type === 'COMMENT' && '📝'}
                                        {item.type === 'WALK' && '🐾'}
                                        {item.type === 'NOTICE' && '📢'}
                                        {item.type === 'EVENT' && '🎉'}
                                        {item.type === 'SYSTEM' && '⚙️'}
                                    </span>
                                </div>

                                <div className="notification_content">
                                    <h3>{item.title}</h3>
                                    <p>{item.message}</p>
                                </div>
                                <span className="notification_time">{formatTime(item.createdAt)}</span>
                                {!item.isRead && <span className="unread_dot" />}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
