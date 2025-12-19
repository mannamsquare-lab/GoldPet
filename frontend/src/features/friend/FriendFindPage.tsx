
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FriendCard } from './FriendCard';
import { friendService } from '../../services/friendService';

export const FriendFindPage = () => {
    const navigate = useNavigate(); 
    
    // Filter State
    const [distance, setDistance] = useState<string>('1km');
    const [sortOrder, setSortOrder] = useState<string>('registered');
    const [petTypes, setPetTypes] = useState<string[]>([]);
    const [genders, setGenders] = useState<string[]>([]);
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false); // Start collapsed to show map

    // Fetch Friends
    const { data: friends, isLoading } = useQuery({
        queryKey: ['friends', distance, sortOrder, petTypes, genders],
        queryFn: () => friendService.getFriends(JSON.stringify({ distance, sortOrder, petTypes, genders })),
    });

    const handleDistanceChange = (value: string) => {
        setDistance(value);
    };

    const handleSortChange = (value: string) => {
        setSortOrder(value);
    };

    const toggleFilter = (value: string, currentList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (currentList.includes(value)) {
            setList(currentList.filter(item => item !== value));
        } else {
            setList([...currentList, value]);
        }
    };

    const handleApply = () => {
        setIsFilterVisible(false);
    };

    const handleReset = () => {
        setDistance('1km');
        setSortOrder('registered');
        setPetTypes([]);
        setGenders([]);
        setIsFilterVisible(true);
    };

    if (isLoading) return <div>Loading...</div>;

    // Helper for Map Pins
    const MapPin = ({ top, left, label }: { top: string, left: string, label: string }) => (
        <div style={{
            position: 'absolute',
            top,
            left,
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1
        }}>
            <div style={{
                background: '#FFF',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#614108',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '4px',
                whiteSpace: 'nowrap'
            }}>
                {label} (150m)
            </div>
            <img src="/assets/images/common/pin_icon.svg" alt="Pin" style={{ width: '32px', height: '32px' }} />
        </div>
    );

    return (
        <div id="friendFind" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
            {/* Tab Section */}
            <div className="group_tab" style={{ zIndex: 50, position: 'relative', background: '#fff' }}>
                <button type="button" className="active" onClick={() => setIsFilterVisible(true)}>친구찾기</button>
                <button type="button" onClick={() => navigate('/friend-list')}>친구목록</button>
            </div>

            {/* Content Container - Relative for Map */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                
                {/* MOCK MAP VIEW (Background) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#e8e8e8 url("https://raw.githubusercontent.com/jioabang/GoldPet/main/map_placeholder_bg.jpg") center/cover no-repeat', // Fallback color
                    zIndex: 0,
                }}>
                    {/* Fake Map Grid lines if image fails */}
                    <div style={{
                        position: 'absolute', inset: 0, 
                        backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
                        backgroundSize: '100px 100px',
                        opacity: 0.3
                    }}></div>
                    
                    {/* Pins */}
                    {friends?.slice(0, 3).map((friend, i) => (
                        <MapPin 
                            key={friend.id}
                            top={`${40 + (i * 15)}%`} 
                            left={`${30 + (i * 20)}%`} 
                            label={friend.petName} 
                        />
                    ))}
                    
                    {/* User Location */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '20px', height: '20px', background: '#4A90E2', border: '3px solid white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></div>
                </div>


                {/* Filter Section Overlay */}
                <style>{`
                    .filter-container {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(10px);
                        z-index: 10;
                        display: grid;
                        grid-template-rows: 0fr;
                        transition: grid-template-rows 0.4s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.4s ease;
                        opacity: 0;
                        border-bottom-left-radius: 24px;
                        border-bottom-right-radius: 24px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    }
                    .filter-container.expanded {
                        grid-template-rows: 1fr;
                        opacity: 1;
                    }
                    .filter-container.collapsed {
                        grid-template-rows: 0fr;
                        opacity: 0;
                        pointer-events: none;
                    }
                    
                    .find_filter_inner {
                        overflow: hidden;
                        min-height: 0;
                    }
    
                    .reopen-container {
                        position: absolute;
                        top: 16px; 
                        left: 0; 
                        right: 0;
                        z-index: 5;
                        transition: opacity 0.5s ease-in-out;
                        pointer-events: none; /* Let clicks pass through container to buttons if needed */
                        display: flex;
                        justify-content: center;
                    }
                    .reopen-container.visible {
                        opacity: 1;
                        pointer-events: auto;
                    }
                    .reopen-container.hidden {
                        opacity: 0;
                        pointer-events: none;
                    }
    
                    .reopen-btn {
                        width: 30vw;
                        height: 11.11vw;
                        border-radius: 5.56vw;
                        font-weight: 600;
                        color: #614108;
                        border: 1px solid #614108;
                        background-color: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(4px);
                        padding: 0;
                    }
                `}</style>
    
                <div className={`filter-container ${isFilterVisible ? 'expanded' : 'collapsed'}`}>
                    <div className="find_filter_inner">
                        <div className="find_filter">
                            <ul>
                                <li>
                                    <p>거리순</p>
                                <div className="filter_list">
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for1" 
                                            checked={distance === '1km'} 
                                            onChange={() => handleDistanceChange('1km')} 
                                        />
                                        <label htmlFor="for1">1km 이내</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for2" 
                                            checked={distance === '3km'} 
                                            onChange={() => handleDistanceChange('3km')} 
                                        />
                                        <label htmlFor="for2">3km 이내</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for3" 
                                            checked={distance === '5km'} 
                                            onChange={() => handleDistanceChange('5km')} 
                                        />
                                        <label htmlFor="for3">5km 이내</label>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p>반려동물 <br />종류</p>
                                <div className="filter_list">
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for4" 
                                            checked={petTypes.includes('dog')}
                                            onChange={() => toggleFilter('dog', petTypes, setPetTypes)}
                                        />
                                        <label htmlFor="for4">강아지</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for5" 
                                            checked={petTypes.includes('cat')}
                                            onChange={() => toggleFilter('cat', petTypes, setPetTypes)}
                                        />
                                        <label htmlFor="for5">고양이</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for6" 
                                            checked={petTypes.includes('reptile')}
                                            onChange={() => toggleFilter('reptile', petTypes, setPetTypes)}
                                        />
                                        <label htmlFor="for6">파충류</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for7" 
                                            checked={petTypes.includes('insect')}
                                            onChange={() => toggleFilter('insect', petTypes, setPetTypes)}
                                        />
                                        <label htmlFor="for7">곤충</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for8" 
                                            checked={petTypes.includes('bird')}
                                            onChange={() => toggleFilter('bird', petTypes, setPetTypes)}
                                        />
                                        <label htmlFor="for8">반려조</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for9" 
                                            checked={petTypes.includes('fish')}
                                            onChange={() => toggleFilter('fish', petTypes, setPetTypes)}
                                        />
                                        <label htmlFor="for9">어류</label>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p>성별</p>
                                <div className="filter_list">
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for10" 
                                            checked={genders.includes('male')}
                                            onChange={() => toggleFilter('male', genders, setGenders)}
                                        />
                                        <label htmlFor="for10">남아</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for11" 
                                            checked={genders.includes('female')}
                                            onChange={() => toggleFilter('female', genders, setGenders)}
                                        />
                                        <label htmlFor="for11">여아</label>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p>등록순</p>
                                <div className="filter_list">
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for12" 
                                            checked={sortOrder === 'registered'} 
                                            onChange={() => handleSortChange('registered')} 
                                        />
                                        <label htmlFor="for12">등록순</label>
                                    </div>
                                    <div className="check_wrap">
                                        <input 
                                            type="checkbox" 
                                            id="for13" 
                                            checked={sortOrder === 'popularity'} 
                                            onChange={() => handleSortChange('popularity')} 
                                        />
                                        <label htmlFor="for13">인기순</label>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div className="btn_wrap">
                            <button type="button" className="btn-effect" onClick={handleReset}>초기화</button>
                            <button type="button" className="btn-effect" onClick={handleApply}>적용</button>
                        </div>
                    </div>
                    </div>
                </div>
    
                <div className={`reopen-container ${!isFilterVisible ? 'visible' : 'hidden'}`} style={{ textAlign: 'center' }}>
                    <button 
                        type="button" 
                        className="reopen-btn btn-effect"
                        onClick={() => setIsFilterVisible(true)}
                    >
                        필터 열기 ▼
                    </button>
                </div>
    
                {/* List View - Only show if filter is open? Or maybe below map details?
                    Actually, typical UI is Map OR List. 
                    If "Friend Find" is active, we might want to show Map predominantly.
                    The previous code showed a list.
                    Let's show a "List Card" overlay at bottom if pins are clicked, 
                    or just keep the list hidden or minimal.
                    For now, I'll hide the list when default view (map mode) is active,
                    or show a "Swipe up for list" behavior.
                    
                    Let's just show the list at the bottom, scrollable over the map?
                    Or stick to the list being GONE here, because the "Friend List" tab exists.
                    Wait, "Friend List" tab is specific (Mutuals/Likes).
                    "Friend Find" usually implies searching NEW friends.
                    So we should have a list here too.
                    
                    Let's make the list absolute positioned at the bottom, draggable?
                    Too complex for this turn.
                    
                    Simpler: Show list BELOW the map? No, map should be full screen.
                    Let's make the list appear as a "Swipeable Sheet" or just a fixed bottom scroll view.
                    For this iteration, I will render the LIST below the reopen button 
                    BUT given the "Map" vibe, maybe just showing the map is enough?
                    
                    Let's Restore the List but make it an overlay "Bottom Sheet" style.
                */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: '#fff',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                    overflowY: 'auto',
                    padding: '24px 16px',
                    zIndex: 5
                }}>
                    <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 16px' }}></div>
                    <div className="friend_list" style={{ padding: 0 }}>
                        {friends?.map((friend) => (
                            <FriendCard key={friend.id} data={friend} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

