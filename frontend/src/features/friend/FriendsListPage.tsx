
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
            {/* Reusing filter styles from FriendFindPage to match alignment */}
            <style>{`
                .filter-container {
                    display: grid;
                    opacity: 1;
                    margin-bottom: 0;
                    grid-template-rows: 1fr;
                }
                
                .find_filter_inner {
                    overflow: hidden;
                    min-height: 0;
                }
            `}</style>
            
            <div className="filter-container expanded">
                <div className="find_filter_inner">
                    <div className="find_filter" style={{paddingBottom: '16px'}}>
                        <div style={{
                            width: '100%', 
                            justifyContent: 'flex-start', 
                            alignItems: 'flex-start', 
                            gap: '8px', 
                            display: 'inline-flex',
                            boxSizing: 'border-box'
                        }}>
                            {/* Tab 1: Mutual */}
                            <div 
                                onClick={() => setActiveSubTab('mutual')} 
                                style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', cursor: 'pointer'}}
                            >
                                <div style={activeSubTab === 'mutual' ? {
                                    flex: '1 1 0', height: '42px', paddingLeft: '16px', paddingRight: '16px', background: '#FFFDF1', overflow: 'hidden', borderRadius: '16px', outline: '1.50px #614108 solid', outlineOffset: '-1.50px', justifyContent: 'center', alignItems: 'center', gap: '4px', display: 'flex'
                                } : {
                                    flex: '1 1 0', height: '42px', paddingLeft: '16px', paddingRight: '16px', background: '#F9ECD2', borderRadius: '16px', justifyContent: 'center', alignItems: 'center', gap: '4px', display: 'flex'
                                }}>
                                    <div style={{
                                        textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#614108', fontSize: '14px', fontFamily: 'Pretendard', fontWeight: activeSubTab === 'mutual' ? 600 : 500, lineHeight: '19.60px', wordWrap: 'break-word'
                                    }}>
                                        서로 좋아해
                                    </div>
                                </div>
                            </div>

                            {/* Tab 2: I Like */}
                            <div 
                                onClick={() => setActiveSubTab('i_like')} 
                                style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', cursor: 'pointer'}}
                            >
                                <div style={activeSubTab === 'i_like' ? {
                                    flex: '1 1 0', height: '42px', paddingLeft: '16px', paddingRight: '16px', background: '#FFFDF1', overflow: 'hidden', borderRadius: '16px', outline: '1.50px #614108 solid', outlineOffset: '-1.50px', justifyContent: 'center', alignItems: 'center', gap: '4px', display: 'flex'
                                } : {
                                    flex: '1 1 0', height: '42px', paddingLeft: '16px', paddingRight: '16px', background: '#F9ECD2', borderRadius: '16px', justifyContent: 'center', alignItems: 'center', gap: '4px', display: 'flex'
                                }}>
                                    <div style={{
                                        textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#614108', fontSize: '14px', fontFamily: 'Pretendard', fontWeight: activeSubTab === 'i_like' ? 600 : 500, lineHeight: '19.60px', wordWrap: 'break-word'
                                    }}>
                                        내가 좋아해
                                    </div>
                                </div>
                            </div>

                            {/* Tab 3: Likes Me */}
                            <div 
                                onClick={() => setActiveSubTab('likes_me')} 
                                style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', cursor: 'pointer'}}
                            >
                                <div style={activeSubTab === 'likes_me' ? {
                                    flex: '1 1 0', height: '42px', paddingLeft: '16px', paddingRight: '16px', background: '#FFFDF1', overflow: 'hidden', borderRadius: '16px', outline: '1.50px #614108 solid', outlineOffset: '-1.50px', justifyContent: 'center', alignItems: 'center', gap: '4px', display: 'flex'
                                } : {
                                    flex: '1 1 0', height: '42px', paddingLeft: '16px', paddingRight: '16px', background: '#F9ECD2', borderRadius: '16px', justifyContent: 'center', alignItems: 'center', gap: '4px', display: 'flex'
                                }}>
                                    <div style={{
                                        textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#614108', fontSize: '14px', fontFamily: 'Pretendard', fontWeight: activeSubTab === 'likes_me' ? 600 : 500, lineHeight: '19.60px', wordWrap: 'break-word'
                                    }}>
                                        나를 좋아해
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
