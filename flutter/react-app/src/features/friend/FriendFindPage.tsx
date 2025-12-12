import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FriendCard } from './FriendCard';

export const FriendFindPage = () => {
    // Defines dummy data for the list to render multiple cards
    const friends = [1, 2, 3]; 
    const navigate = useNavigate(); 

    // Filter State
    const [distance, setDistance] = useState<string>('1km');
    const [sortOrder, setSortOrder] = useState<string>('registered');
    const [petTypes, setPetTypes] = useState<string[]>([]);
    const [genders, setGenders] = useState<string[]>([]);
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

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

    return (
        <div id="friendFind">
            {/* Tab Section */}
            <div className="group_tab">
                <button type="button" className="active" onClick={() => setIsFilterVisible(true)}>친구찾기</button>
                <button type="button" onClick={() => navigate('/friend-list')}>친구목록</button>
            </div>

            {/* Filter Section */}
            {/* Filter Section with Animation */}
            <style>{`
                .filter-container {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows 0.4s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.4s ease;
                    opacity: 0;
                    margin-bottom: 0;
                }
                .filter-container.expanded {
                    grid-template-rows: 1fr;
                    opacity: 1;
                    margin-bottom: 0;
                }
                .filter-container.collapsed {
                    grid-template-rows: 0fr;
                    opacity: 0;
                    margin-bottom: 0;
                }
                
                .find_filter_inner {
                    overflow: hidden;
                    min-height: 0;
                }

                .reopen-container {
                    transition: opacity 0.5s ease-in-out, height 0.5s ease;
                    overflow: hidden;
                }
                .reopen-container.visible {
                    opacity: 1;
                    height: auto;
                    padding: 11.11vw 4.44vw 0;
                }
                .reopen-container.hidden {
                    opacity: 0;
                    height: 0;
                    padding: 0;
                    pointer-events: none;
                }

                .reopen-btn {
                    width: 30vw;
                    height: 11.11vw;
                    border-radius: 5.56vw;
                    font-weight: 600;
                    color: #614108;
                    border: 1px solid #614108;
                    background-color: transparent;
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

            {/* Friend List */}
            <div className="friend_list">
                {friends.map((item, index) => (
                    <FriendCard key={index} index={index} />
                ))}
            </div>

            <div className="more_wrap">
                <button type="button" className="btn-effect">더보기 <img src="/assets/images/common/more_btn.svg" alt="" /></button>
            </div>
        </div>
    );
};
