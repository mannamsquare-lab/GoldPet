
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { FriendCard } from './FriendCard';
import { friendService } from '../../services/friendService';

import { Loading } from '../../components/common/Loading';

export const FriendFindPage = () => {
    const navigate = useNavigate(); 
    
    // User Location State
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

    // Filter visibility state
    const [isFilterVisible, setIsFilterVisible] = useState(true);

    // Initial Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn("Geolocation blocked or failed:", error);
                    // Fallback or just don't have location
                }
            );
        }
    }, []);

    // Filter Selection State (UI only)
    const [selectedDistance, setSelectedDistance] = useState<string>('1km');
    const [selectedSortOrder, setSelectedSortOrder] = useState<string>('registered');
    const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

    // Applied Filter State (Triggers Query)
    const [appliedDistance, setAppliedDistance] = useState<string>('1km');
    const [appliedSortOrder, setAppliedSortOrder] = useState<string>('registered');
    const [appliedPetTypes, setAppliedPetTypes] = useState<string[]>([]);
    const [appliedGenders, setAppliedGenders] = useState<string[]>([]);

    // Fetch Friends with Pagination
    const { 
        data: friendsData, 
        isLoading, 
        isFetchingNextPage, 
        hasNextPage, 
        fetchNextPage 
    } = useInfiniteQuery({
        queryKey: ['friends', appliedDistance, appliedSortOrder, appliedPetTypes, appliedGenders, userLocation],
        queryFn: async ({ pageParam = 0 }) => {
            const filterPayload = {
                distance: appliedDistance,
                sortOrder: appliedSortOrder,
                petTypes: appliedPetTypes,
                genders: appliedGenders,
                lat: userLocation?.lat,
                lng: userLocation?.lng
            };

            return friendService.getFriends(JSON.stringify(filterPayload), pageParam, 10);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.last ? undefined : allPages.length;
        },
        enabled: true,
    });

    const { data: petSpecies } = useQuery({
        queryKey: ['pets', 'species'],
        queryFn: friendService.getSpecies,
        staleTime: Infinity, // Static data - cache indefinitely
    });

    const handleDistanceChange = (value: string) => {
        setSelectedDistance(value);
    };

    const handleSortChange = (value: string) => {
        setSelectedSortOrder(value);
    };

    const toggleFilter = (value: string, currentList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (currentList.includes(value)) {
            setList(currentList.filter(item => item !== value));
        } else {
            setList([...currentList, value]);
        }
    };

    const handleApply = () => {
        setAppliedDistance(selectedDistance);
        setAppliedSortOrder(selectedSortOrder);
        setAppliedPetTypes(selectedPetTypes);
        setAppliedGenders(selectedGenders);
        // Hide filter with animation
        setIsFilterVisible(false);
    };

    const handleReset = () => {
        // Reset all filters - uncheck everything
        setSelectedDistance('');
        setSelectedSortOrder('');
        setSelectedPetTypes([]);
        setSelectedGenders([]);
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const [hiddenFriendIds, setHiddenFriendIds] = useState<number[]>([]);

    const flattenedFriends = (friendsData?.pages.flatMap(page => page.content) || [])
        .filter(friend => !hiddenFriendIds.includes(friend.id));

    const handleLikeStateChange = (friendId: number) => {
        setHiddenFriendIds(prev => [...prev, friendId]);
    };

    if (isLoading) return <Loading description="친구를 찾고 있어요..." />;

    return (
        <div id="friendFind">
            {/* button class - active로 전환 */}
            <div className="group_tab">
                <button type="button" className="active">친구찾기</button>
                <button type="button" onClick={() => navigate('/friend-list')}>친구목록</button>
            </div>

            {/* Filter toggle button - shown when filter is hidden */}
            {!isFilterVisible && (
                <div className="filter_toggle_wrap" style={{ 
                    padding: '11.11vw 4.44vw 0', 
                    display: 'flex', 
                    justifyContent: 'center' 
                }}>
                    <button 
                        type="button" 
                        onClick={toggleFilterVisibility}
                        style={{
                            padding: '10px 24px',
                            background: '#fff',
                            border: '1px solid #614108',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#614108'
                        }}
                    >
                        필터 설정
                    </button>
                </div>
            )}

            {/* Filter area with animation */}
            <div 
                className="find_filter"
                style={{
                    maxHeight: isFilterVisible ? '500px' : '0',
                    paddingTop: isFilterVisible ? '' : '0',
                    paddingBottom: isFilterVisible ? '' : '0',
                    overflow: 'hidden',
                    opacity: isFilterVisible ? 1 : 0,
                    transform: isFilterVisible ? 'translateY(0)' : 'translateY(-10px)',
                    transition: 'all 0.5s ease-in-out',
                    visibility: isFilterVisible ? 'visible' : 'hidden',
                }}
            >
                <ul>
                    <li>
                        <p>거리순</p>
                        <div className="filter_list">
                            <div className="check_wrap">
                                <input type="checkbox" id="for1" checked={selectedDistance === '1km'} onChange={() => handleDistanceChange('1km')} disabled={!userLocation} />
                                <label htmlFor="for1">1km 이내</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for2" checked={selectedDistance === '3km'} onChange={() => handleDistanceChange('3km')} disabled={!userLocation} />
                                <label htmlFor="for2">3km 이내</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for3" checked={selectedDistance === '5km'} onChange={() => handleDistanceChange('5km')} disabled={!userLocation} />
                                <label htmlFor="for3">5km 이내</label>
                            </div>
                        </div>
                    </li>
                    <li>
                        <p>반려동물 <br />종류</p>
                        <div className="filter_list">
                            {petSpecies?.map((species) => (
                                <div className="check_wrap" key={species.id}>
                                    <input 
                                        type="checkbox" 
                                        id={`species-${species.id}`} 
                                        checked={selectedPetTypes.includes(species.code)} 
                                        onChange={() => toggleFilter(species.code, selectedPetTypes, setSelectedPetTypes)} 
                                    />
                                    <label htmlFor={`species-${species.id}`}>{species.name}</label>
                                </div>
                            ))}
                        </div>
                    </li>
                    <li>
                        <p>성별</p>
                        <div className="filter_list">
                            <div className="check_wrap">
                                <input type="checkbox" id="for10" checked={selectedGenders.includes('MALE')} onChange={() => toggleFilter('MALE', selectedGenders, setSelectedGenders)} />
                                <label htmlFor="for10">남아</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for11" checked={selectedGenders.includes('FEMALE')} onChange={() => toggleFilter('FEMALE', selectedGenders, setSelectedGenders)} />
                                <label htmlFor="for11">여아</label>
                            </div>
                        </div>
                    </li>
                    <li>
                        <p>등록순</p>
                        <div className="filter_list">
                            <div className="check_wrap">
                                <input type="checkbox" id="for12" checked={selectedSortOrder === 'registered'} onChange={() => handleSortChange('registered')} />
                                <label htmlFor="for12">등록순</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for13" checked={selectedSortOrder === 'popular'} onChange={() => handleSortChange('popular')} />
                                <label htmlFor="for13">인기순</label>
                            </div>
                        </div>
                    </li>
                </ul>
                <div className="btn_wrap">
                    <button type="button" onClick={handleReset}>초기화</button>
                    <button type="button" onClick={handleApply}>적용</button>
                </div>
            </div>

            <div className="friend_list">
                {flattenedFriends.map((friend) => (
                    <FriendCard 
                        key={friend.id} 
                        data={friend} 
                        onLikeStateChange={() => handleLikeStateChange(friend.id)}
                    />
                ))}
                
                {!isLoading && flattenedFriends.length === 0 && (
                     <div className="no_data" style={{ padding: '50px 0', textAlign: 'center', color: '#999' }}>
                         조건에 맞는 친구가 없습니다.
                     </div>
                )}
            </div>
            
            {hasNextPage && (
                <div className="more_wrap">
                    <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? '로딩중...' : '더보기'} 
                        {!isFetchingNextPage && <img src="/assets/images/common/more_btn.svg" alt="" />}
                    </button>
                </div>
            )}
        </div>
    );
};
