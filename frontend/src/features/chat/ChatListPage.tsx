
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../stores/authStore';
import '../../styles/chat.css';
import { Loading } from '../../components/common/Loading';

// Empty state component
const ChatEmptyState = () => {
    return (
        <div className="chat_empty_state">
            <div className="chat_empty_content">
                <div className="chat_empty_icon">
                    <div className="chat_empty_icon_bg"></div>
                </div>
                <div className="chat_empty_text">
                    <div className="chat_empty_title">채팅이 없어요ㅠ</div>
                    <div className="chat_empty_description">반려인과 매칭해주세요</div>
                </div>
            </div>
        </div>
    );
};

const ChatListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const currentUserId = user?.id;
    const [activeTab, setActiveTab] = useState('one'); // 'one', 'group', 'request'

    // URL state에서 activeTab 정보 가져오기
    useEffect(() => {
        if (location.state && 'activeTab' in location.state) {
            setActiveTab(location.state.activeTab as string);
        }
    }, [location.state]);

    // Fetch Chat Rooms (shorter stale time for real-time feel)
    const { data: chatRooms, isLoading } = useQuery({
        queryKey: ['chatRooms'],
        queryFn: chatService.getChatRooms,
        staleTime: 1000 * 10, // 10 seconds - chat list needs to be fresh
    });

    if (isLoading) return <Loading description="채팅 목록을 불러오고 있어요" />;

    // Filter chats based on tab
    const oneOnOneChats = chatRooms?.filter(room => !room.isGroup) || [];
    const groupChats = chatRooms?.filter(room => room.isGroup) || [];
    const requestChats: any[] = []; // Not implemented in service yet, keeping empty or mock locally if needed

    return (
        <div id="chatOne">
            <div className="group_tab">
                <button 
                    type="button" 
                    className={activeTab === 'one' ? 'active btn-effect' : 'btn-effect'}
                    onClick={() => setActiveTab('one')}
                >
                    1:1
                </button>
                <button 
                    type="button"
                    className={activeTab === 'group' ? 'active btn-effect' : 'btn-effect'}
                    onClick={() => setActiveTab('group')}
                >
                    그룹
                </button>
                <button 
                    type="button"
                    className={activeTab === 'request' ? 'active btn-effect' : 'btn-effect'}
                    onClick={() => setActiveTab('request')}
                >
                    대화요청
                </button>
            </div>

            {/* 1:1 Chat List */}
            {activeTab === 'one' && (
                <>
                    {oneOnOneChats.length === 0 ? (
                        <ChatEmptyState />
                    ) : (
                        <ul className="chat_list">
                            {oneOnOneChats.map((chat) => {
                                // Find the other participant (not current user)
                                const otherParticipant = chat.participants.find(p => p.id !== currentUserId) || chat.participants[0];
                                return (
                                <li key={chat.id}>
                                    <button
                                        type="button"
                                        className="btn-effect"
                                        onClick={() => navigate(`/chat/${chat.id}`)}
                                    >
                                        <div className="profile_img">
                                            {/* Show other participant's image for 1:1 */}
                                            <img src={otherParticipant?.profileImageUrl || '/assets/images/temp/temp_dog_profile.png'} alt={chat.name} />
                                        </div>
                                        <div className="txt_wrap">
                                            <strong>{chat.name}</strong>
                                            <p>{chat.lastMessage}</p>
                                        </div>
                                        <div className="day_txt">
                                            {chat.unreadCount > 0 && <p className="count_num">{chat.unreadCount}</p>}
                                            {/* Simple date formatting */}
                                            <p className="last_day">{new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </button>
                                </li>
                            );
                            })}
                        </ul>
                    )}
                </>
            )}

            {/* Group Chat List */}
            {activeTab === 'group' && (
                <>
                    {groupChats.length === 0 ? (
                        <ChatEmptyState />
                    ) : (
                        <ul className="chat_list">
                            {groupChats.map((chat) => (
                                <li key={chat.id}>
                                    <button 
                                        type="button" 
                                        className="btn-effect"
                                        onClick={() => navigate(`/chat/group/${chat.id}`)}
                                    >
                                        <div className="profile_img profile_img_group">
                                            {chat.participants.slice(0, 4).map((user, index) => (
                                                <div 
                                                    key={user.id} 
                                                    className="profile_img_item"
                                                    style={{ zIndex: 4 - index }}
                                                >
                                                    <img src={user.profileImageUrl || '/assets/images/temp/temp_dog_profile.png'} alt={`${user.nickname}`} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="txt_wrap">
                                            <strong>{chat.name}</strong>
                                            <p>{chat.lastMessage}</p>
                                        </div>
                                        <div className="day_txt">
                                            {chat.unreadCount > 0 && <p className="count_num">{chat.unreadCount}</p>}
                                            <p className="last_day">{new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {/* Contact Request List */}
            {activeTab === 'request' && (
                <>
                    {requestChats.length === 0 ? (
                        <ChatEmptyState />
                    ) : (
                        <ul className="contact_list">
                            {/* Rendering logic for requests if we had them */}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatListPage;

