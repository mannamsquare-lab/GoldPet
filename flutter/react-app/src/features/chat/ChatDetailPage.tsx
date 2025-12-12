
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../../styles/chat-detail.css';

interface Message {
    id: number;
    text: string;
    time: string;
    isMine: boolean;
    profileImg?: string;
    senderName?: string;
}

const ChatDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { chatId } = useParams<{ chatId: string }>();
    const isGroupChat = location.pathname.includes('/chat/group/');
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Dummy data - 실제로는 API에서 가져올 데이터
    const chatUser = isGroupChat ? {
        id: chatId || '1',
        name: '동네 산책 모임',
        profileImgs: [
            '/assets/images/temp/temp_dog_profile.png',
            '/assets/images/temp/temp_dog_profile.png',
            '/assets/images/temp/temp_dog_profile.png',
            '/assets/images/temp/temp_dog_profile.png'
        ],
    } : {
        id: chatId || '1',
        name: '보리꼬리',
        profileImg: '/assets/images/temp/temp_dog_profile.png',
    };

    const [messages, setMessages] = useState<Message[]>(isGroupChat ? [
        { id: 1, text: '안녕하세요. 멋쟁이님 반가워요. 저희 댕댕이와 너무 잘 어울릴 거 같아서 챗 신청했어요~^^', time: '오후 2:30', isMine: false, profileImg: '/assets/images/temp/temp_dog_profile.png', senderName: '보리' },
        { id: 2, text: '안녕하세요. 이렇게 챗 주셔서 놀랐어요~^^\n프로필을 보니 저희 멍멍이와 잘 어울리는 성향을 가진 거 같아요.', time: '오후 2:32', isMine: true },
        { id: 3, text: '네~ 저는 주말에 특히 토요일에 보라매 공원에서 산책 자주해요~', time: '오후 2:33', isMine: false, profileImg: '/assets/images/temp/temp_dog_profile.png', senderName: '코코' },
        { id: 4, text: '앗!! 저도 토요일에 주로 산책해요~^^', time: '오후 2:34', isMine: true },
        { id: 5, text: '그럼 이번 주 토요일에 같이 산책하실래요?', time: '오후 2:35', isMine: false, profileImg: '/assets/images/temp/temp_dog_profile.png', senderName: '뽀삐' },
    ] : [
        { id: 1, text: '안녕하세요. 멋쟁이님 반가워요. 저희 댕댕이와 너무 잘 어울릴 거 같아서 챗 신청했어요~^^', time: '오후 2:30', isMine: false },
        { id: 2, text: '안녕하세요. 이렇게 챗 주셔서 놀랐어요~^^\n프로필을 보니 저희 멍멍이와 잘 어울리는 성향을 가진 거 같아요.', time: '오후 2:32', isMine: true },
        { id: 3, text: '네~ 저는 주말에 특히 토요일에 보라매 공원에서 산책 자주해요~', time: '오후 2:33', isMine: false },
        { id: 4, text: '앗!! 저도 토요일에 주로 산책해요~^^', time: '오후 2:34', isMine: true },
    ]);

    const quickReplies = [
        '안녕하세요. 반가워요',
        '산책 같이 할까요?',
        '지금 어디로 산책 가시나요?',
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage: Message = {
                id: messages.length + 1,
                text: message,
                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
                isMine: true,
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    const handleQuickReply = (text: string) => {
        const newMessage: Message = {
            id: messages.length + 1,
            text: text,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
            isMine: true,
        };
        setMessages([...messages, newMessage]);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat_detail_page">
            {/* Header */}
            <div className="chat_detail_header">
                <div className="chat_detail_header_top">
                    <div className="chat_detail_header_spacer"></div>
                </div>
                <div className="chat_detail_header_content">
                    <div className="chat_detail_header_inner">
                        <button 
                            type="button" 
                            className="chat_detail_back_btn btn-effect"
                            onClick={() => navigate('/chat', { state: { activeTab: isGroupChat ? 'group' : 'one' } })}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="#614108" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="chat_detail_user_info">
                            {isGroupChat && 'profileImgs' in chatUser ? (
                                <div className="chat_detail_profile_img chat_detail_profile_img_group">
                                    {chatUser.profileImgs.slice(0, 4).map((img, index) => (
                                        <div 
                                            key={index} 
                                            className="chat_detail_profile_img_item"
                                            style={{ zIndex: 4 - index }}
                                        >
                                            <img src={img} alt={`${chatUser.name} 멤버 ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="chat_detail_profile_img">
                                    <img src={'profileImg' in chatUser ? chatUser.profileImg : ''} alt={chatUser.name} />
                                </div>
                            )}
                            <div className="chat_detail_user_name">{chatUser.name}</div>
                        </div>
                    </div>
                    <div className="chat_detail_header_divider"></div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat_detail_messages">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`chat_detail_message ${msg.isMine ? 'chat_detail_message_mine' : 'chat_detail_message_other'}`}
                    >
                        {!msg.isMine && (
                            <div className="chat_detail_message_profile">
                                <img 
                                    src={isGroupChat && msg.profileImg ? msg.profileImg : ('profileImg' in chatUser ? chatUser.profileImg : '')} 
                                    alt={isGroupChat && msg.senderName ? msg.senderName : chatUser.name} 
                                />
                            </div>
                        )}
                        <div className="chat_detail_message_content">
                            <div className={`chat_detail_message_bubble ${msg.isMine ? 'chat_detail_message_bubble_mine' : 'chat_detail_message_bubble_other'}`}>
                                <div className="chat_detail_message_text">
                                    {msg.text.split('\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < msg.text.split('\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="chat_detail_message_time">{msg.time}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat_detail_input_area">
                {/* Quick Replies */}
                <div className="chat_detail_quick_replies">
                    {quickReplies.map((reply, index) => (
                        <button
                            key={index}
                            type="button"
                            className="chat_detail_quick_reply_btn btn-effect"
                            onClick={() => handleQuickReply(reply)}
                        >
                            {reply}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="chat_detail_input_wrap">
                    <button 
                        type="button" 
                        className="chat_detail_attach_btn btn-effect"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.544 4.3847L5.44005 11.4887C3.59572 13.333 3.75132 16.4789 5.57312 18.3007C7.39492 20.1225 10.6668 20.4041 12.5111 18.5597L19.6151 11.4558C20.9564 10.1144 20.8255 8.09719 19.5006 6.77225C18.1756 5.44731 16.1584 5.31639 14.817 6.65773L8.82838 12.6464C8.0265 13.4483 7.60881 14.6088 8.4369 15.4369C9.26499 16.265 10.4255 15.8473 11.2274 15.0454L16.6368 9.63603" stroke="#614108" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <input
                        type="text"
                        className="chat_detail_input"
                        placeholder="메세지를 입력하세요..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        type="button"
                        className="chat_detail_send_btn btn-effect"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                    >
                        <span>전송</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatDetailPage;

