
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../services/notificationService';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import './NotificationPage.css';

const TABS = [
    { id: 'ALL', label: '전체' },
    { id: 'FRIEND', label: '친구' },
    { id: 'CHAT', label: '채팅' },
    { id: 'WALK', label: '산책' },
    { id: 'COMMUNITY', label: '커뮤니티' },
    { id: 'NOTICE', label: '공지' },
    { id: 'EVENT', label: '이벤트' },
];

const NotificationPage = () => {
    const navigate = useNavigate();
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
            // silent
        } finally {
            setLoading(false);
        }
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
        <SubPageLayout
            title="알림"
            rightAction={
                <button type="button" className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                    모두 읽음
                </button>
            }
        >
            <div id="notificationContainer">
                {/* Category Tabs */}
                <div className="community_tab">
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
                                <li key={item.id} className="notification_item" onClick={() => handleNotificationClick(item)}>
                                    <div className="notification_profile">
                                        <img
                                            src={item.senderProfileImage || '/assets/images/common/profile_none_img.svg'}
                                            alt=""
                                        />
                                        {!item.isRead && <span className="unread_dot" />}
                                    </div>
                                    <div className="notification_content">
                                        <strong className="notification_title">{item.title}</strong>
                                        <p className="notification_message">{item.message}</p>
                                        <span className="notification_time">{formatTime(item.createdAt)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </SubPageLayout>
    );
};

export default NotificationPage;
