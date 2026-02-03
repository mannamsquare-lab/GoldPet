
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../services/notificationService';


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
        <div className="sub_page_wrap">
            {/* Header */}
            <header className="header">
                <div className="left_btn">
                    <button type="button" className="back_btn" onClick={handleBack}>
                        <img src="/assets/images/common/back_btn.svg" alt="뒤로가기" />
                    </button>
                    <h2>알림</h2>
                </div>
            </header>

            <div className="content_wrap">
                {/* Tabs */}
                <div className="tab_menu_wrap scroll_type" style={{ paddingTop: '10px' }}>
                    <ul className="tab_menu" style={{ flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        {TABS.map(tab => (
                            <li key={tab.id} className={activeTab === tab.id ? 'active' : ''}>
                                <button type="button" onClick={() => setActiveTab(tab.id)}>
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* List */}
                <div className="notice_list_wrap" style={{ marginTop: '20px', padding: '0 20px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>로딩 중...</div>
                    ) : notifications.length === 0 ? (
                        <div className="no_data_wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
                            <img src="/assets/images/common/no_data_icon.svg" alt="" style={{ marginBottom: '16px' }} />
                            <p style={{ color: '#999', fontSize: '14px' }}>새로운 알림이 없습니다.</p>
                        </div>
                    ) : (
                        <ul>
                            {notifications.map(item => (
                                <li key={item.id} style={{ 
                                    padding: '16px 0', 
                                    borderBottom: '1px solid #f0f0f0', 
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px'
                                }}>
                                    <div className="icon_box" style={{ 
                                        width: '40px', height: '40px', 
                                        borderRadius: '50%', 
                                        backgroundColor: item.isRead ? '#f5f5f5' : '#FFF4E6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {/* Simple icon logic based on type */}
                                        {item.type === 'MATCH' && '💕'}
                                        {item.type === 'LIKE' && '❤️'}
                                        {item.type === 'MESSAGE' && '💬'}
                                        {item.type === 'COMMENT' && '📝'}
                                        {item.type === 'WALK' && '🐾'}
                                        {item.type === 'NOTICE' && '📢'}
                                        {item.type === 'EVENT' && '🎉'}
                                        {item.type === 'SYSTEM' && '⚙️'}
                                    </div>
                                    
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{item.title}</span>
                                            <span style={{ fontSize: '12px', color: '#999' }}>{formatTime(item.createdAt)}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{item.message}</p>
                                    </div>

                                    {/* Optional: Delete button */}
                                    {/* <button onClick={() => handleDelete(item.id)} style={{ color: '#ccc' }}>x</button> */}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
