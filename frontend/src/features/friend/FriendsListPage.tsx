
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FriendCard } from './FriendCard';
import { friendService } from '../../services/friendService';

export const FriendsListPage = () => {
    const navigate = useNavigate(); 
    
    // Fetch Friends
    const { data: friends, isLoading } = useQuery({
        queryKey: ['friends', 'list'],
        queryFn: () => friendService.getFriends(),
    });

    // Sub-tab State
    const [activeSubTab, setActiveSubTab] = useState<'mutual' | 'i_like' | 'likes_me'>('mutual');

    if (isLoading) return <div>Loading...</div>;

    return (
        <div id="friendFind">
            {/* Tab Section */}
            <div className="group_tab">
                <button type="button" onClick={() => navigate('/friend-find')}>친구찾기</button>
                <button type="button" className="active">친구목록</button>
            </div>

            {/* Sub-tab Filter Section */}
            <div className="find_filter" style={{ paddingBottom: '16px' }}>
                 <div className="filter_list" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    {/* Tab 1: Mutual */}
                    <button 
                        type="button" 
                        onClick={() => setActiveSubTab('mutual')}
                        style={{
                            flex: 1,
                            height: '42px',
                            background: activeSubTab === 'mutual' ? '#FFFDF1' : '#F9ECD2',
                            border: activeSubTab === 'mutual' ? '1.5px solid #614108' : 'none',
                            borderRadius: '16px',
                            color: '#614108',
                            fontWeight: activeSubTab === 'mutual' ? 600 : 500,
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        서로 좋아해
                    </button>

                    {/* Tab 2: I Like */}
                    <button 
                        type="button" 
                        onClick={() => setActiveSubTab('i_like')}
                        style={{
                            flex: 1,
                            height: '42px',
                            background: activeSubTab === 'i_like' ? '#FFFDF1' : '#F9ECD2',
                            border: activeSubTab === 'i_like' ? '1.5px solid #614108' : 'none',
                            borderRadius: '16px',
                            color: '#614108',
                            fontWeight: activeSubTab === 'i_like' ? 600 : 500,
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        내가 좋아해
                    </button>

                    {/* Tab 3: Likes Me */}
                    <button 
                         type="button" 
                         onClick={() => setActiveSubTab('likes_me')}
                         style={{
                            flex: 1,
                            height: '42px',
                            background: activeSubTab === 'likes_me' ? '#FFFDF1' : '#F9ECD2',
                            border: activeSubTab === 'likes_me' ? '1.5px solid #614108' : 'none',
                            borderRadius: '16px',
                            color: '#614108',
                            fontWeight: activeSubTab === 'likes_me' ? 600 : 500,
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        나를 좋아해
                    </button>
                </div>
            </div>

            {/* Friend List */}
            <div className="friend_list">
                {friends?.map((friend) => (
                    <FriendCard key={friend.id} data={friend} />
                ))}
            </div>

            <div className="more_wrap">
                <button type="button" className="btn-effect">더보기 <img src="/assets/images/common/more_btn.svg" alt="" /></button>
            </div>
        </div>
    );
};
