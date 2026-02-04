
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import type { FileInfo } from '../../services/chatService';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { Loading } from '../../components/common/Loading';
import '../../styles/chat-detail.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface SelectedFile {
    file: File;
    preview: string;
    type: 'image' | 'video' | 'file';
}

const MAX_FILES = 10; // Maximum number of files allowed at once

const ChatDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { chatId } = useParams<{ chatId: string }>();
    const isGroupChat = location.pathname.includes('/chat/group/');
    const [message, setMessage] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    // WebSocket for real-time messaging (disabled in mock mode)
    useChatWebSocket({
        roomId: chatId,
        enabled: !!chatId && !USE_MOCK,
    });

    // Fetch Chat Room info (to get participant details)
    const { data: chatRooms } = useQuery({
        queryKey: ['chatRooms'],
        queryFn: chatService.getChatRooms,
        staleTime: 1000 * 60, // 1 minute
    });

    // Fetch Messages
    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['chatMessages', chatId],
        queryFn: () => chatService.getMessages(chatId!),
        enabled: !!chatId,
    });

    // Send Message Mutation
    const sendMutation = useMutation({
        mutationFn: async ({ content, messageType, fileId }: { content: string; messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE'; fileId?: number }) => {
            return chatService.sendMessage(chatId!, content, { messageType, fileId });
        },
        onSuccess: (newMessage) => {
            queryClient.setQueryData(['chatMessages', chatId], (old: any[]) => {
                const oldMessages = old || [];
                // Compare as strings to handle type mismatch (REST returns number, WebSocket returns string)
                const newId = String(newMessage.id);
                if (oldMessages.some((m: any) => String(m.id) === newId)) {
                    return oldMessages;
                }
                return [...oldMessages, newMessage];
            });
        },
    });

    // Upload File Mutation
    const uploadMutation = useMutation({
        mutationFn: (file: File) => chatService.uploadFile(file),
    });

    // Get current user ID
    const currentUserId = parseInt(localStorage.getItem('userId') || '0', 10);

    // Find current chat room from chatRooms list
    const currentRoom = chatRooms?.find(room => String(room.id) === chatId);

    // Get other participant info (for 1:1 chat, filter out current user)
    const otherParticipant = currentRoom?.participants?.find(p => p.id !== currentUserId);

    const chatUser = isGroupChat ? {
        id: chatId || '1',
        name: currentRoom?.name || '그룹 채팅',
        profileImgs: currentRoom?.participants?.slice(0, 4).map(p =>
            p.profileImageUrl || '/assets/images/temp/temp_dog_profile.png'
        ) || [],
    } : {
        id: chatId || '1',
        name: otherParticipant?.nickname || currentRoom?.name || '상대방',
        profileImg: otherParticipant?.profileImageUrl || '/assets/images/temp/temp_dog_profile.png',
    };

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

    useEffect(() => {
        if (chatId && !USE_MOCK) {
            chatService.markAsRead(chatId);
        }
    }, [chatId]);

    const handleSendMessage = async () => {
        if (selectedFiles.length > 0) {
            await handleSendFiles();
            return;
        }
        if (message.trim()) {
            sendMutation.mutate({ content: message });
            setMessage('');
        }
    };

    const handleSendFiles = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const totalFiles = selectedFiles.length;

            for (let i = 0; i < totalFiles; i++) {
                const selectedFile = selectedFiles[i];
                setUploadProgress(Math.round((i / totalFiles) * 100));

                // Upload file first
                const uploadResult = await uploadMutation.mutateAsync(selectedFile.file);

                // Determine message type
                const messageType = selectedFile.type === 'image' ? 'IMAGE'
                    : selectedFile.type === 'video' ? 'VIDEO'
                    : 'FILE';

                // Send message with file (only include text message with the first file)
                await sendMutation.mutateAsync({
                    content: i === 0 ? (message || '') : '',
                    messageType,
                    fileId: uploadResult.id,
                });
            }

            // Clear selected files and message
            selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
            setSelectedFiles([]);
            setMessage('');
        } catch (error) {
            console.error('Failed to send files:', error);
            alert('파일 전송에 실패했습니다.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleQuickReply = (text: string) => {
        sendMutation.mutate({ content: text });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleAttachClick = () => {
        setShowAttachMenu(!showAttachMenu);
    };

    const handleFileSelect = (accept: string, capture?: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = accept;
            if (capture) {
                fileInputRef.current.setAttribute('capture', capture);
            } else {
                fileInputRef.current.removeAttribute('capture');
            }
            fileInputRef.current.click();
        }
        setShowAttachMenu(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles: SelectedFile[] = [];
        const remainingSlots = MAX_FILES - selectedFiles.length;

        for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
            const file = files[i];

            // Determine file type
            let type: 'image' | 'video' | 'file' = 'file';
            if (file.type.startsWith('image/')) {
                type = 'image';
            } else if (file.type.startsWith('video/')) {
                type = 'video';
            }

            // Create preview URL
            const preview = URL.createObjectURL(file);
            newFiles.push({ file, preview, type });
        }

        if (files.length > remainingSlots) {
            alert(`최대 ${MAX_FILES}개까지만 첨부할 수 있습니다.`);
        }

        setSelectedFiles(prev => [...prev, ...newFiles]);

        // Reset input
        e.target.value = '';
    };

    const handleCancelFile = (index: number) => {
        setSelectedFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleCancelAllFiles = () => {
        selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        setSelectedFiles([]);
    };

    const renderMessageContent = (msg: any) => {
        const content = msg.content || msg.textContent || '';
        const msgType = msg.messageType || msg.type || 'TEXT';
        const file: FileInfo | undefined = msg.file;

        // Handle image messages
        if ((msgType === 'IMAGE' || msgType === 'image') && file) {
            return (
                <div className="chat_detail_message_image">
                    <img src={file.url} alt="첨부 이미지" onClick={() => window.open(file.url, '_blank')} />
                    {content && <div className="chat_detail_message_caption">{content}</div>}
                </div>
            );
        }

        // Handle video messages
        if ((msgType === 'VIDEO' || msgType === 'video') && file) {
            return (
                <div className="chat_detail_message_video">
                    <video src={file.url} controls />
                    {content && <div className="chat_detail_message_caption">{content}</div>}
                </div>
            );
        }

        // Handle file messages
        if ((msgType === 'FILE' || msgType === 'file') && file) {
            const fileName = file.url.split('/').pop() || '파일';
            const fileSize = file.sizeBytes ? `${(file.sizeBytes / 1024).toFixed(1)} KB` : '';
            return (
                <div className="chat_detail_message_file" onClick={() => window.open(file.url, '_blank')}>
                    <div className="chat_detail_file_icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="chat_detail_file_info">
                        <span className="chat_detail_file_name">{fileName}</span>
                        {fileSize && <span className="chat_detail_file_size">{fileSize}</span>}
                    </div>
                </div>
            );
        }

        // Default: text message
        return (
            <div className="chat_detail_message_text">
                {content.split('\n').map((line: string, i: number) => (
                    <span key={i}>
                        {line}
                        {i < content.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </div>
        );
    };

    if (isLoading) return <Loading description="대화 내용을 불러오고 있어요" />;

    return (
        <div className="chat_detail_page">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
            />

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
                    const timestamp = msg.timestamp || msg.createdAt;
                    // Compare as numbers (both should be numbers, but ensure type consistency)
                    const isMine = Number(msg.senderId) === currentUserId;
                    const time = timestamp ? new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

                    return (
                    <div
                        key={msg.id}
                        className={`chat_detail_message ${isMine ? 'chat_detail_message_mine' : 'chat_detail_message_other'}`}
                    >
                        {!isMine && (
                            <div className="chat_detail_message_profile">
                                <img
                                    src={
                                        isGroupChat
                                            ? (currentRoom?.participants?.find(p => p.id === Number(msg.senderId))?.profileImageUrl || '/assets/images/temp/temp_dog_profile.png')
                                            : ('profileImg' in chatUser ? chatUser.profileImg : '/assets/images/temp/temp_dog_profile.png')
                                    }
                                    alt={isGroupChat ? 'User' : chatUser.name}
                                />
                            </div>
                        )}
                        <div className="chat_detail_message_content">
                            <div className={`chat_detail_message_bubble ${isMine ? 'chat_detail_message_bubble_mine' : 'chat_detail_message_bubble_other'}`}>
                                {renderMessageContent(msg)}
                            </div>
                            <div className="chat_detail_message_time">{time}</div>
                        </div>
                    </div>
                )})}
                <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {selectedFiles.length > 0 && (
                <div className="chat_detail_file_preview_container">
                    <div className="chat_detail_file_preview_header">
                        <span className="chat_detail_file_preview_count">{selectedFiles.length}개 파일 선택됨</span>
                        <button
                            type="button"
                            className="chat_detail_file_preview_clear_all"
                            onClick={handleCancelAllFiles}
                        >
                            전체 삭제
                        </button>
                    </div>
                    <div className="chat_detail_file_preview_list">
                        {selectedFiles.map((selectedFile, index) => (
                            <div key={index} className="chat_detail_file_preview">
                                <div className="chat_detail_file_preview_content">
                                    {selectedFile.type === 'image' && (
                                        <img src={selectedFile.preview} alt="미리보기" />
                                    )}
                                    {selectedFile.type === 'video' && (
                                        <video src={selectedFile.preview} />
                                    )}
                                    {selectedFile.type === 'file' && (
                                        <span className="chat_detail_file_preview_name">{selectedFile.file.name}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="chat_detail_file_preview_remove"
                                    onClick={() => handleCancelFile(index)}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#614108" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Click outside to close attach menu */}
            {showAttachMenu && (
                <div
                    className="chat_detail_attach_menu_overlay"
                    onClick={() => setShowAttachMenu(false)}
                />
            )}

            {/* Input Area */}
            <div className="chat_detail_input_area">
                {/* Quick Replies */}
                {selectedFiles.length === 0 && (
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
                )}

                {/* Input */}
                <div className="chat_detail_input_container">
                    {/* Attachment Menu */}
                    {showAttachMenu && (
                        <div className="chat_detail_attach_menu">
                            <button type="button" onClick={() => handleFileSelect('image/*', 'environment')}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="13" r="4" stroke="#614108" strokeWidth="2"/>
                                </svg>
                                <span>카메라</span>
                            </button>
                            <button type="button" onClick={() => handleFileSelect('image/*,video/*')}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#614108" strokeWidth="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5" fill="#614108"/>
                                    <path d="M21 15L16 10L5 21" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>갤러리</span>
                            </button>
                            <button type="button" onClick={() => handleFileSelect('*/*')}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 2V8H20" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>파일</span>
                            </button>
                        </div>
                    )}

                    <div className="chat_detail_input_wrap">
                        <button
                            type="button"
                            className={`chat_detail_attach_btn btn-effect ${showAttachMenu ? 'active' : ''}`}
                            onClick={handleAttachClick}
                        >
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.544 4.3847L5.44005 11.4887C3.59572 13.333 3.75132 16.4789 5.57312 18.3007C7.39492 20.1225 10.6668 20.4041 12.5111 18.5597L19.6151 11.4558C20.9564 10.1144 20.8255 8.09719 19.5006 6.77225C18.1756 5.44731 16.1584 5.31639 14.817 6.65773L8.82838 12.6464C8.0265 13.4483 7.60881 14.6088 8.4369 15.4369C9.26499 16.265 10.4255 15.8473 11.2274 15.0454L16.6368 9.63603" stroke="#614108" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <input
                            type="text"
                            className="chat_detail_input"
                            placeholder={selectedFiles.length > 0 ? "캡션을 입력하세요..." : "메세지를 입력하세요..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            type="button"
                            className="chat_detail_send_btn btn-effect"
                            onClick={handleSendMessage}
                            disabled={(!message.trim() && selectedFiles.length === 0) || isUploading}
                        >
                            <span>{isUploading ? `${uploadProgress}%` : '전송'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDetailPage;
