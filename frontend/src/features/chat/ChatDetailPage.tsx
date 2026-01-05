
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import { Loading } from '../../components/common/Loading';
import '../../styles/chat-detail.css';

const ChatDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { chatId } = useParams<{ chatId: string }>();
    const isGroupChat = location.pathname.includes('/chat/group/');
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Fetch Messages
    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['chatMessages', chatId],
        queryFn: () => chatService.getMessages(chatId!), // ID handling needed
        enabled: !!chatId,
    });

    // Send Message Mutation
    const mutation = useMutation({
        mutationFn: (text: string) => chatService.sendMessage(chatId!, text),
        onSuccess: (newMessage) => {
             // Optimistic update or just refetch or push to cache
             queryClient.setQueryData(['chatMessages', chatId], (old: any[]) => [...(old || []), newMessage]);
        },
    });

    const chatUser = isGroupChat ? {
        id: chatId || '1',
        name: '동네 산책 모임', // In real app, fetch room info separately or pass via state
        profileImgs: [
            '/assets/images/temp/temp_dog_profile.png',
            '/assets/images/temp/temp_dog_profile.png',
            '/assets/images/temp/temp_dog_profile.png',
            '/assets/images/temp/temp_dog_profile.png'
        ],
    } : {
        id: chatId || '1',
        name: '상대방', // Should fetch user info
        profileImg: '/assets/images/temp/temp_dog_profile.png',
    };
    
    // Quick Replies (Static for now)
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
            mutation.mutate(message);
            setMessage('');
        }
    };

    const handleQuickReply = (text: string) => {
        mutation.mutate(text);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (isLoading) return <Loading description="대화 내용을 불러오고 있어요" />;

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
                                    {chatUser.profileImgs?.slice(0, 4).map((img, index) => (
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
                {messages.map((msg: any) => {
                    // Normalize message data from service to UI props if needed
                    // Service: { id, roomId, senderId, content, timestamp, type }
                    // UI expects: { id, text, time, isMine, profileImg?, senderName? }
                    const isMine = msg.senderId === 1; // Assume current user is 1
                    const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
                    
                    return (
                    <div 
                        key={msg.id} 
                        className={`chat_detail_message ${isMine ? 'chat_detail_message_mine' : 'chat_detail_message_other'}`}
                    >
                        {!isMine && (
                            <div className="chat_detail_message_profile">
                                <img 
                                    src={isGroupChat ? '/assets/images/temp/temp_dog_profile.png' : ('profileImg' in chatUser ? chatUser.profileImg : '')} 
                                    alt={isGroupChat ? 'User' : chatUser.name} 
                                />
                            </div>
                        )}
                        <div className="chat_detail_message_content">
                            <div className={`chat_detail_message_bubble ${isMine ? 'chat_detail_message_bubble_mine' : 'chat_detail_message_bubble_other'}`}>
                                <div className="chat_detail_message_text">
                                    {msg.content.split('\n').map((line: string, i: number) => (
                                        <span key={i}>
                                            {line}
                                            {i < msg.content.split('\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="chat_detail_message_time">{time}</div>
                        </div>
                    </div>
                )})}
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

