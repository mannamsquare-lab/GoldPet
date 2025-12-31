
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FriendCard } from './FriendCard';
import { friendService } from '../../services/friendService';

export const FriendFindPage = () => {
    const navigate = useNavigate(); 
    
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

    // Fetch Friends (Depends on Applied State)
    const { data: friends, isLoading } = useQuery({
        queryKey: ['friends', appliedDistance, appliedSortOrder, appliedPetTypes, appliedGenders],
        queryFn: () => friendService.getFriends(JSON.stringify({ 
            distance: appliedDistance, 
            sortOrder: appliedSortOrder, 
            petTypes: appliedPetTypes, 
            genders: appliedGenders 
        })),
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
    };

    const handleReset = () => {
        const defaultDist = '1km';
        const defaultSort = 'registered';
        const defaultArr: string[] = [];
        
        // Reset UI
        setSelectedDistance(defaultDist);
        setSelectedSortOrder(defaultSort);
        setSelectedPetTypes(defaultArr);
        setSelectedGenders(defaultArr);
        
        // Optionally Reset Query immediately? 
        // User usually expects "Reset" to clear form. 
        // If they want to search with defaults, they click Apply again? 
        // Or Reset clears filters and SEARCHES defaults?
        // Let's assume Reset simply restores UI defaults. User clicks Apply to confirm.
        // Actually, "Reset" often means "Clear everything". 
        // Better UX: Reset sets UI to defaults. 
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div id="friendFind">
            {/* button class - active로 전환 */}
            <div className="group_tab">
                <button type="button" className="active">친구찾기</button>
                <button type="button" onClick={() => navigate('/friend-list')}>친구목록</button>
            </div>

            <div className="find_filter">
                <ul>
                    <li>
                        <p>거리순</p>
                        <div className="filter_list">
                            <div className="check_wrap">
                                <input type="checkbox" id="for1" checked={selectedDistance === '1km'} onChange={() => handleDistanceChange('1km')} />
                                <label htmlFor="for1">1km 이내</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for2" checked={selectedDistance === '3km'} onChange={() => handleDistanceChange('3km')} />
                                <label htmlFor="for2">3km 이내</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for3" checked={selectedDistance === '5km'} onChange={() => handleDistanceChange('5km')} />
                                <label htmlFor="for3">5km 이내</label>
                            </div>
                        </div>
                    </li>
                    <li>
                        <p>반려동물 <br />종류</p>
                        <div className="filter_list">
                            <div className="check_wrap">
                                <input type="checkbox" id="for4" checked={selectedPetTypes.includes('dog')} onChange={() => toggleFilter('dog', selectedPetTypes, setSelectedPetTypes)} />
                                <label htmlFor="for4">강아지</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for5" checked={selectedPetTypes.includes('cat')} onChange={() => toggleFilter('cat', selectedPetTypes, setSelectedPetTypes)} />
                                <label htmlFor="for5">고양이</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for6" checked={selectedPetTypes.includes('reptile')} onChange={() => toggleFilter('reptile', selectedPetTypes, setSelectedPetTypes)} />
                                <label htmlFor="for6">파충류</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for7" checked={selectedPetTypes.includes('insect')} onChange={() => toggleFilter('insect', selectedPetTypes, setSelectedPetTypes)} />
                                <label htmlFor="for7">곤충</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for8" checked={selectedPetTypes.includes('bird')} onChange={() => toggleFilter('bird', selectedPetTypes, setSelectedPetTypes)} />
                                <label htmlFor="for8">반려조</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for9" checked={selectedPetTypes.includes('fish')} onChange={() => toggleFilter('fish', selectedPetTypes, setSelectedPetTypes)} />
                                <label htmlFor="for9">어류</label>
                            </div>
                        </div>
                    </li>
                    <li>
                        <p>성별</p>
                        <div className="filter_list">
                            <div className="check_wrap">
                                <input type="checkbox" id="for10" checked={selectedGenders.includes('male')} onChange={() => toggleFilter('male', selectedGenders, setSelectedGenders)} />
                                <label htmlFor="for10">남아</label>
                            </div>
                            <div className="check_wrap">
                                <input type="checkbox" id="for11" checked={selectedGenders.includes('female')} onChange={() => toggleFilter('female', selectedGenders, setSelectedGenders)} />
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
                                <input type="checkbox" id="for13" checked={selectedSortOrder === 'popularity'} onChange={() => handleSortChange('popularity')} />
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
                {friends?.map((friend) => (
                    <FriendCard key={friend.id} data={friend} />
                ))}
            </div>
            
            <div className="more_wrap">
                <button type="button">더보기 <img src="/assets/images/common/more_btn.svg" alt="" /></button>
            </div>
        </div>
    );
};
