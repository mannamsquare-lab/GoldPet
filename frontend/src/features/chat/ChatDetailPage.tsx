
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import type { FileInfo } from '../../services/chatService';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { useAuthStore } from '../../stores/authStore';
import { Loading } from '../../components/common/Loading';
import { BackButton } from '../../components/common/BackButton';
import { useToast } from '../../contexts/ToastContext';
import { useAlert } from '../../contexts/AlertContext';
import { nativeBridge } from '../../bridge/nativeBridge';
import { blockService } from '../../services/blockService';
import { CACHE_TIME } from '../../config/queryConfig';
import '../../styles/chat-detail.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Component for expandable long messages (5 lines max when collapsed)
const ExpandableText = ({ content }: { content: string }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const el = contentRef.current;
        if (el) {
            // Check if content is overflowing (truncated by line-clamp)
            setIsOverflowing(el.scrollHeight > el.clientHeight);
        }
    }, [content]);

    return (
        <div className="chat_detail_message_text">
            <div
                ref={contentRef}
                className={`chat_detail_expandable_content ${!isExpanded ? 'chat_detail_expandable_clamped' : ''}`}
            >
                {content.split('\n').map((line: string, i: number) => (
                    <span key={i}>
                        {line}
                        {i < content.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </div>
            {(isOverflowing || isExpanded) && (
                <button
                    type="button"
                    className="chat_detail_message_expand_btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '접기' : '더보기'}
                </button>
            )}
        </div>
    );
};

interface SelectedFile {
    file: File;
    preview: string;
    type: 'image' | 'video' | 'file';
}

const MAX_FILES = 10; // Maximum number of files allowed at once

// Helper to get file icon based on MIME type or extension
const getFileIcon = (file: File | { mimeType?: string; url?: string }) => {
    const mimeType = 'type' in file ? file.type : file.mimeType || '';
    const fileName = 'name' in file ? file.name : file.url?.split('/').pop() || '';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    // PDF
    if (mimeType === 'application/pdf' || ext === 'pdf') {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="12" y="17" textAnchor="middle" fontSize="6" fill="#E53935" fontWeight="bold">PDF</text>
            </svg>
        );
    }

    // Word documents
    if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="12" y="17" textAnchor="middle" fontSize="5" fill="#2196F3" fontWeight="bold">DOC</text>
            </svg>
        );
    }

    // Excel/Spreadsheet
    if (mimeType.includes('sheet') || mimeType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="12" y="17" textAnchor="middle" fontSize="5" fill="#4CAF50" fontWeight="bold">XLS</text>
            </svg>
        );
    }

    // Text files
    if (mimeType.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(ext)) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 13H16M8 17H12" stroke="#757575" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        );
    }

    // Compressed/Archive files
    if (mimeType.includes('zip') || mimeType.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="12" y="17" textAnchor="middle" fontSize="5" fill="#FF9800" fontWeight="bold">ZIP</text>
            </svg>
        );
    }

    // Default file icon
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
};

// Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const queryClient = useQueryClient();

    const { showToast } = useToast();
    const { showAlert, showConfirm } = useAlert();
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);

    // Get current user ID from auth store (needed for WebSocket)
    const { user } = useAuthStore();
    const currentUserId = user?.id || 0;

    // Listen for file download completion from native bridge
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.type === 'fileDownloaded') {
                showToast(`${e.data.data?.fileName || '파일'} 다운로드 완료`, 'success');
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [showToast]);

    // WebSocket for real-time messaging (disabled in mock mode)
    const { sendTypingEvent, typingUsers } = useChatWebSocket({
        roomId: chatId,
        currentUserId,
        enabled: !!chatId && !USE_MOCK,
    });

    // Debounced typing event
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleTyping = () => {
        sendTypingEvent(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 1 second of no input
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingEvent(false);
        }, 1000);
    };

    // Fetch Chat Room info (to get participant details)
    const { data: chatRooms } = useQuery({
        queryKey: ['chatRooms'],
        queryFn: chatService.getChatRooms,
        ...CACHE_TIME.REAL_TIME,
    });

    // Fetch Messages
    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['chatMessages', chatId],
        queryFn: () => chatService.getMessages(chatId!),
        enabled: !!chatId,
        ...CACHE_TIME.REAL_TIME,
    });

    // Notify Flutter when entering/leaving chat room (to suppress push notifications)
    useEffect(() => {
        if (chatId) {
            nativeBridge.callMethod('setCurrentChatRoom', { chatRoomId: chatId });
        }
        return () => {
            nativeBridge.callMethod('setCurrentChatRoom', { chatRoomId: null });
        };
    }, [chatId]);

    // Send Message Mutation
    const sendMutation = useMutation({
        mutationFn: async ({ content, messageType, fileId }: { content: string; messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE'; fileId?: number }) => {
            return chatService.sendMessage(chatId!, content, { messageType, fileId });
        },
        onError: () => showToast('메시지 전송에 실패했습니다.', 'error'),
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

    const isInitialLoadRef = useRef(true);

    const scrollToBottom = useCallback((instant = false) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: instant ? 'instant' : 'smooth'
        });
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            if (isInitialLoadRef.current) {
                // Initial load: scroll immediately, then again after images load
                scrollToBottom(true);
                const timer = setTimeout(() => scrollToBottom(true), 300);
                isInitialLoadRef.current = false;
                return () => clearTimeout(timer);
            } else {
                // New message: smooth scroll
                scrollToBottom(false);
            }
        }
    }, [messages]);

    useEffect(() => {
        if (chatId && !USE_MOCK) {
            chatService.markAsRead(chatId).then(() => {
                // Invalidate chatRooms to update unread count in the list
                queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
            });
        }
    }, [chatId, queryClient]);

    // Auto-scroll when keyboard opens (viewport shrinks)
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        let prevHeight = viewport.height;
        let prevWidth = viewport.width;

        const handleResize = () => {
            const currentHeight = viewport.height;
            const currentWidth = viewport.width;
            if (currentHeight < prevHeight && currentWidth === prevWidth) {
                scrollToBottom(true);
            }
            prevHeight = currentHeight;
            prevWidth = currentWidth;
        };

        viewport.addEventListener('resize', handleResize);
        return () => viewport.removeEventListener('resize', handleResize);
    }, [scrollToBottom]);

    // Fallback: scroll on textarea focus (for browsers without visualViewport)
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleFocus = () => {
            setTimeout(() => scrollToBottom(true), 300);
        };

        textarea.addEventListener('focus', handleFocus);
        return () => textarea.removeEventListener('focus', handleFocus);
    }, [scrollToBottom]);

    const handleSendMessage = async () => {
        // Stop typing indicator when sending
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        sendTypingEvent(false);

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
            showAlert('파일 전송에 실패했습니다.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleQuickReply = (text: string) => {
        sendTypingEvent(false);
        sendMutation.mutate({ content: text });
    };

    const handleBlockUser = () => {
        setShowHeaderMenu(false);
        if (!otherParticipant) return;
        showConfirm('이 사용자를 차단하시겠습니까?\n차단하면 서로의 게시글과 프로필이 보이지 않습니다.', async () => {
            try {
                await blockService.blockUser(otherParticipant.id);
                showAlert('사용자를 차단했습니다.', () => {
                    navigate('/chat', { state: { activeTab: 'one' } });
                });
            } catch {
                showAlert('차단에 실패했습니다.');
            }
        });
    };

    const handleLeaveRoom = () => {
        setShowHeaderMenu(false);
        showConfirm('채팅방을 나가시겠습니까?', () => {
            navigate('/chat', { state: { activeTab: isGroupChat ? 'group' : 'one' } });
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 한글 IME 조합 중이면 무시 (마지막 글자 중복 방지)
        if (e.nativeEvent.isComposing) return;

        // Mobile: Enter for newline, send button for sending
        // Desktop: Shift+Enter for newline, Enter for sending (optional - currently disabled)
        // Uncomment below to enable Enter-to-send on desktop only:
        // if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        //     e.preventDefault();
        //     handleSendMessage();
        // }
    };

    // Auto-resize textarea based on content
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const maxHeight = 120; // ~4-5 lines max
            textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [message]);

    const handleAttachClick = () => {
        setShowAttachMenu(!showAttachMenu);
    };

    const handleFileSelect = (accept?: string, capture?: string) => {
        if (fileInputRef.current) {
            // For "all files", remove accept attribute entirely for best browser compatibility
            if (accept) {
                fileInputRef.current.accept = accept;
            } else {
                fileInputRef.current.removeAttribute('accept');
            }
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
            showAlert(`최대 ${MAX_FILES}개까지만 첨부할 수 있습니다.`);
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
                    <img src={file.url} alt="첨부 이미지" onClick={() => setPreviewImageUrl(file.url)} style={{ cursor: 'pointer' }} />
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
            const fileName = file.originalFileName || file.url.split('/').pop() || '파일';
            const fileSize = file.sizeBytes ? formatFileSize(file.sizeBytes) : '';
            const handleDownload = async () => {
                try {
                    // Try native bridge (WebView) - download to device
                    if ((window as any).NativeBridge) {
                        const { nativeBridge } = await import('../../bridge/nativeBridge');
                        await nativeBridge.callMethod('downloadFile', { url: file.url, fileName });
                        return;
                    }
                } catch {
                    // fallback below
                }
                // Browser fallback
                window.open(file.url, '_blank');
            };
            return (
                <div className="chat_detail_message_file" onClick={handleDownload} style={{ cursor: 'pointer' }}>
                    <div className="chat_detail_file_icon">
                        {getFileIcon(file)}
                    </div>
                    <div className="chat_detail_file_info">
                        <span className="chat_detail_file_name">{fileName}</span>
                        {fileSize && <span className="chat_detail_file_size">{fileSize}</span>}
                    </div>
                </div>
            );
        }

        // Default: text message - use ExpandableText component
        return <ExpandableText content={content} />;
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
                        <BackButton onClick={() => navigate('/chat', { state: { activeTab: isGroupChat ? 'group' : 'one' } })} />
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
                        {!isGroupChat && (
                            <button className="chat_detail_menu_btn" onClick={() => setShowHeaderMenu(!showHeaderMenu)}>
                                <img src="/assets/images/common/option_icon.svg" alt="메뉴" />
                            </button>
                        )}
                    </div>
                    <div className="chat_detail_header_divider"></div>
                </div>
            </div>

            {/* Header Menu Dropdown */}
            {showHeaderMenu && (
                <div className="chat_detail_menu_overlay" onClick={() => setShowHeaderMenu(false)}>
                    <div className="chat_detail_menu_dropdown" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={handleBlockUser}>차단하기</button>
                        <button type="button" onClick={handleLeaveRoom}>나가기</button>
                    </div>
                </div>
            )}

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

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                    <div className="chat_detail_typing_indicator">
                        <div className="chat_detail_typing_dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span className="chat_detail_typing_text">
                            {isGroupChat
                                ? `${Array.from(typingUsers).map(userId => currentRoom?.participants?.find(p => p.id === userId)?.nickname).filter(Boolean).join(', ') || typingUsers.size + '명'}님이 입력 중`
                                : `${chatUser.name}님이 입력 중`}
                        </span>
                    </div>
                )}

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
                                        <div className="chat_detail_file_preview_doc">
                                            {getFileIcon(selectedFile.file)}
                                            <span className="chat_detail_file_preview_ext">
                                                {selectedFile.file.name.split('.').pop()?.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="chat_detail_file_preview_remove"
                                    onClick={() => handleCancelFile(index)}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
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
                            <button type="button" onClick={() => handleFileSelect('image/*,video/*', 'environment')}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="13" r="4" stroke="var(--color-primary)" strokeWidth="2"/>
                                </svg>
                                <span>카메라</span>
                            </button>
                            <button type="button" onClick={() => handleFileSelect('image/*,video/*')}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--color-primary)" strokeWidth="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5" fill="var(--color-primary)"/>
                                    <path d="M21 15L16 10L5 21" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>앨범</span>
                            </button>
                            <button type="button" onClick={() => handleFileSelect()}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 2V8H20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                <path d="M12.544 4.3847L5.44005 11.4887C3.59572 13.333 3.75132 16.4789 5.57312 18.3007C7.39492 20.1225 10.6668 20.4041 12.5111 18.5597L19.6151 11.4558C20.9564 10.1144 20.8255 8.09719 19.5006 6.77225C18.1756 5.44731 16.1584 5.31639 14.817 6.65773L8.82838 12.6464C8.0265 13.4483 7.60881 14.6088 8.4369 15.4369C9.26499 16.265 10.4255 15.8473 11.2274 15.0454L16.6368 9.63603" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        <textarea
                            ref={textareaRef}
                            className="chat_detail_input"
                            placeholder={selectedFiles.length > 0 ? "캡션을 입력하세요..." : "메세지를 입력하세요..."}
                            value={message}
                            maxLength={5000}
                            rows={1}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        {message.length > 100 && (
                            <span className="chat_detail_char_count">
                                {message.length}/5000
                            </span>
                        )}
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

            {/* Image Preview Modal */}
            {previewImageUrl && (
                <div className="chat_detail_image_modal" onClick={() => setPreviewImageUrl(null)}>
                    <button
                        type="button"
                        className="chat_detail_image_modal_close"
                        onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(null); }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <img
                        src={previewImageUrl}
                        alt="이미지 미리보기"
                        className="chat_detail_image_modal_img"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatDetailPage;
