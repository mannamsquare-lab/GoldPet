import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { friendService, type Friend } from '../../services/friendService';
import { chatService } from '../../services/chatService';
import { Loading } from '../../components/common/Loading';
import '../../styles/chat.css';

const CreateGroupChatPage = () => {
    const navigate = useNavigate();
    const [selectedFriends, setSelectedFriends] = useState<Set<number>>(new Set());
    const [groupName, setGroupName] = useState('');
    const [step, setStep] = useState<'select' | 'name'>('select');

    // Fetch mutual likes (서로 좋아해)
    const { data: mutualFriends = [], isLoading } = useQuery({
        queryKey: ['mutualLikes'],
        queryFn: friendService.getMutualLikes,
    });

    // Create group chat mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            const participantIds = Array.from(selectedFriends);
            return chatService.createRoom(participantIds, groupName || undefined);
        },
        onSuccess: (room) => {
            navigate(`/chat/group/${room.id}`, { replace: true });
        },
        onError: () => {
            alert('그룹 채팅 생성에 실패했습니다.');
        },
    });

    const toggleFriend = (friendId: number) => {
        setSelectedFriends(prev => {
            const newSet = new Set(prev);
            if (newSet.has(friendId)) {
                newSet.delete(friendId);
            } else {
                newSet.add(friendId);
            }
            return newSet;
        });
    };

    const handleNext = () => {
        if (selectedFriends.size < 2) {
            alert('그룹 채팅은 2명 이상 선택해야 합니다.');
            return;
        }
        setStep('name');
    };

    const handleCreate = () => {
        createMutation.mutate();
    };

    const handleBack = () => {
        if (step === 'name') {
            setStep('select');
        } else {
            navigate(-1);
        }
    };

    if (isLoading) return <Loading description="친구 목록을 불러오고 있어요" />;

    return (
        <div id="createGroupChat">
            {/* Header */}
            <header className="create_group_header">
                <button type="button" className="back_btn btn-effect" onClick={handleBack}>
                    <img src="/assets/images/layout/header_icon_back.svg" alt="뒤로가기" />
                </button>
                <h1>{step === 'select' ? '그룹 채팅 만들기' : '그룹 이름 설정'}</h1>
                <div className="header_right">
                    {step === 'select' ? (
                        <button
                            type="button"
                            className="next_btn btn-effect"
                            onClick={handleNext}
                            disabled={selectedFriends.size < 2}
                        >
                            다음
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="create_btn btn-effect"
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? '생성 중...' : '완료'}
                        </button>
                    )}
                </div>
            </header>

            {step === 'select' ? (
                <>
                    {/* Selected count */}
                    <div className="selected_count">
                        <span className="count">{selectedFriends.size}</span>명 선택됨
                        {selectedFriends.size < 2 && (
                            <span className="hint"> (2명 이상 선택)</span>
                        )}
                    </div>

                    {/* Friend list */}
                    {mutualFriends.length === 0 ? (
                        <div className="empty_state">
                            <div className="empty_icon"></div>
                            <p className="empty_title">서로 좋아해 친구가 없어요</p>
                            <p className="empty_desc">먼저 친구와 매칭해보세요!</p>
                        </div>
                    ) : (
                        <ul className="friend_select_list">
                            {mutualFriends.map((friend: Friend) => (
                                <li key={friend.id}>
                                    <button
                                        type="button"
                                        className={`friend_item btn-effect ${selectedFriends.has(friend.id) ? 'selected' : ''}`}
                                        onClick={() => toggleFriend(friend.id)}
                                    >
                                        <div className="checkbox">
                                            {selectedFriends.has(friend.id) && (
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="profile_img">
                                            <img
                                                src={friend.profileImageUrl || '/assets/images/temp/temp_dog_profile.png'}
                                                alt={friend.nickname}
                                            />
                                        </div>
                                        <div className="friend_info">
                                            <strong>{friend.nickname}</strong>
                                            <p>{friend.petName} · {friend.petBreed}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                /* Group name input step */
                <div className="group_name_step">
                    <div className="selected_preview">
                        <p className="preview_label">선택된 친구 ({selectedFriends.size}명)</p>
                        <div className="preview_avatars">
                            {mutualFriends
                                .filter((f: Friend) => selectedFriends.has(f.id))
                                .slice(0, 5)
                                .map((friend: Friend) => (
                                    <div key={friend.id} className="preview_avatar">
                                        <img
                                            src={friend.profileImageUrl || '/assets/images/temp/temp_dog_profile.png'}
                                            alt={friend.nickname}
                                        />
                                    </div>
                                ))}
                            {selectedFriends.size > 5 && (
                                <div className="preview_more">+{selectedFriends.size - 5}</div>
                            )}
                        </div>
                    </div>

                    <div className="name_input_wrap">
                        <label htmlFor="groupName">그룹 이름 (선택)</label>
                        <input
                            id="groupName"
                            type="text"
                            placeholder="그룹 이름을 입력하세요"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            maxLength={30}
                        />
                        <p className="input_hint">
                            입력하지 않으면 참여자 이름으로 표시됩니다
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateGroupChatPage;
