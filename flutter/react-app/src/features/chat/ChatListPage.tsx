
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/chat.css';

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
    const [activeTab, setActiveTab] = useState('one'); // 'one', 'group', 'request'

    // URL state에서 activeTab 정보 가져오기
    useEffect(() => {
        if (location.state && 'activeTab' in location.state) {
            setActiveTab(location.state.activeTab as string);
        }
    }, [location.state]);

    // Dummy data for 1:1 chat list
    const chatList: Array<{ id: number; name: string; message: string; time: string; count: number; img: string }> = [
        { id: 1, name: '보리', message: '산책 같이 하실래요?', time: '1시간 전', count: 99, img: '/assets/images/temp/temp_dog_profile.png' },
        { id: 2, name: '코코', message: '네 좋아요!', time: '2시간 전', count: 0, img: '/assets/images/temp/temp_dog_profile.png' },
    ];

    // Dummy data for group chat list
    const groupChatList: Array<{ id: number; name: string; message: string; time: string; count: number; profileImgs: string[] }> = [
        { 
            id: 1, 
            name: '동네 산책 모임', 
            message: '다음 산책 일정 정해요!', 
            time: '30분 전', 
            count: 5, 
            profileImgs: [
                '/assets/images/temp/temp_dog_profile.png',
                '/assets/images/temp/temp_dog_profile.png',
                '/assets/images/temp/temp_dog_profile.png',
                '/assets/images/temp/temp_dog_profile.png'
            ]
        },
    ];

    // Dummy data for contact requests
    const contactList: Array<{ id: number; name: string; message: string; time: string; status: string; img: string }> = [
        { id: 1, name: '멍멍이', message: '채팅을 요청했어요.', time: '1시간 전', status: 'pending', img: '/assets/images/temp/temp_dog_profile.png' },
        { id: 2, name: '야옹이', message: '채팅 요청을 거절했어요.', time: '2시간 전', status: 'rejected', img: '/assets/images/temp/temp_dog_profile.png' },
        { id: 3, name: '냥냥이', message: '채팅 요청을 거절했어요.', time: '3시간 전', status: 'rejected', img: '/assets/images/temp/temp_dog_profile.png' },
    ];

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
                    {chatList.length === 0 ? (
                        <ChatEmptyState />
                    ) : (
                        <ul className="chat_list">
                            {chatList.map((chat) => (
                                <li key={chat.id}>
                                    <button 
                                        type="button" 
                                        className="btn-effect"
                                        onClick={() => navigate(`/chat/${chat.id}`)}
                                    >
                                        <div className="profile_img">
                                            <img src={chat.img} alt={chat.name} />
                                        </div>
                                        <div className="txt_wrap">
                                            <strong>{chat.name}</strong>
                                            <p>{chat.message}</p>
                                        </div>
                                        <div className="day_txt">
                                            {chat.count > 0 && <p className="count_num">{chat.count}</p>}
                                            <p className="last_day">{chat.time}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}

            {/* Group Chat List */}
            {activeTab === 'group' && (
                <>
                    {groupChatList.length === 0 ? (
                        <ChatEmptyState />
                    ) : (
                        <ul className="chat_list">
                            {groupChatList.map((chat) => (
                                <li key={chat.id}>
                                    <button 
                                        type="button" 
                                        className="btn-effect"
                                        onClick={() => navigate(`/chat/group/${chat.id}`)}
                                    >
                                        <div className="profile_img profile_img_group">
                                            {chat.profileImgs.slice(0, 4).map((img, index) => (
                                                <div 
                                                    key={index} 
                                                    className="profile_img_item"
                                                    style={{ zIndex: 4 - index }}
                                                >
                                                    <img src={img} alt={`${chat.name} 멤버 ${index + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="txt_wrap">
                                            <strong>{chat.name}</strong>
                                            <p>{chat.message}</p>
                                        </div>
                                        <div className="day_txt">
                                            {chat.count > 0 && <p className="count_num">{chat.count}</p>}
                                            <p className="last_day">{chat.time}</p>
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
                    {contactList.length === 0 ? (
                        <ChatEmptyState />
                    ) : (
                        <ul className="contact_list">
                            {contactList.map((contact) => (
                                <li key={contact.id}>
                                    <div className="profile_img">
                                        <img src={contact.img} alt={contact.name} />
                                    </div>
                                    <div className="txt_wrap">
                                        <strong>{contact.name}</strong>
                                        <p>{contact.message}</p>
                                    </div>
                                    <div className="contact_btn_wrap">
                                        {contact.status === 'pending' ? (
                                            <>
                                                <button type="button" className="btn-effect">거절</button>
                                                <button type="button" className="btn-effect">수락</button>
                                            </>
                                        ) : (
                                            <button type="button" className="btn-effect">삭제</button>
                                        )}
                                    </div>
                                    <p className="last_day">{contact.time}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatListPage;

