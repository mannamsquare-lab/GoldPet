import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { petService, FALLBACK_ATTRIBUTES_SCHEMA } from '../../services/petService';
import { userService } from '../../services/userService';
import { Loading } from '../../components/common/Loading';
import { ProfileImageSlider } from '../../components/common/ProfileImageSlider';
import { ProfileSettingsSection } from './components/ProfileSettingsSection';

const ProfilePetTab: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    
    // Fetch my pets list (uses default staleTime, invalidated after pet updates)
    const { data: myPets, isLoading: isPetsLoading } = useQuery({
        queryKey: ['pets', 'my'],
        queryFn: petService.getMyPets,
    });

    // Fetch user data (uses default staleTime, invalidated after profile update)
    const { data: fetchedUser } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: userService.getMe,
    });

    const currentUser = fetchedUser || user;

    const handleNotificationChange = async (enabled: boolean) => {
        if (!user) return;
        
        try {
            const updatedUser = await userService.updateNotification(enabled);
            updateUser(updatedUser);
        } catch (error) {
            console.error('Failed to update notification setting:', error);
            throw error;
        }
    };
    
    const hasPet = myPets && myPets.length > 0;
    const pet = hasPet ? myPets[0] : null;

    const handleRegister = () => {
        navigate('/profile/pet/edit');
    };

    const handleEdit = () => {
        navigate('/profile/pet/edit');
    };

    // Helper to get label for attribute value
    const getAttributeLabel = (code: string, value: string): string => {
        const attributeDef = FALLBACK_ATTRIBUTES_SCHEMA.find(attr => attr.code === code);
        if (!attributeDef) return value;
        
        if (attributeDef.inputType === 'SELECT') {
            const option = attributeDef.options.find(opt => opt.value === value);
            return option ? option.label : value;
        }
        return value;
    };
    
    // Parse temperamentTags string (e.g., "TRAIT_ACTIVITY:HIGH, TRAIT_SPECIAL_NOTES:Cute")
    const parsedAttributes = React.useMemo(() => {
        if (!pet?.temperamentTags) return {};
        
        // Handle if it's an array (mock) or string (backend)
        const tagsString = Array.isArray(pet.temperamentTags) 
            ? pet.temperamentTags.join(',') 
            : pet.temperamentTags; // It is String in backend entity now

        if (!tagsString) return {};

        const result: Record<string, string> = {};
        tagsString.split(',').forEach(tag => {
           const parts = tag.trim().split(':');
           if (parts.length === 2) {
               const [code, value] = parts;
               result[code] = value;
           } else if (parts.length === 1 && parts[0]) {
                // If just code exists or legacy format
                result[parts[0]] = parts[0];
           }
        });
        return result;
    }, [pet?.temperamentTags]);

    // Helper to render sections
    const renderAttributeSection = (category: string, boxColorClass: string) => {
        const items = FALLBACK_ATTRIBUTES_SCHEMA.filter(attr => attr.category === category);
        if (items.length === 0) return null;

        return (
             <div className={`box_wrap ${boxColorClass}`}>
                {items.map(attr => {
                    const value = parsedAttributes[attr.code];
                    // Special case for Special Notes -> show full width
                    if (attr.code === 'TRAIT_SPECIAL_NOTES') {
                        return (
                            <dl key={attr.code} className="full_w">
                                <dt>{attr.name}</dt>
                                <dd>{value ? value : '-'}</dd>
                            </dl>
                        );
                    }
                    
                    return (
                        <dl key={attr.code}>
                            <dt>{attr.name}</dt>
                            <dd>{value ? getAttributeLabel(attr.code, value) : '-'}</dd>
                        </dl>
                    );
                })}
            </div>
        );
    };

    if (isPetsLoading) {
        return <Loading description="반려동물 정보를 불러오고 있어요" />;
    }

    const ownerProfileImage = (currentUser?.profileImageUrls && currentUser.profileImageUrls.length > 0)
        ? currentUser.profileImageUrls[0]
        : (currentUser?.profileImageUrl || "/assets/images/common/profile_none_img.svg");

    // EMPTY STATE (Matches profile_pet_info_not.html)
    if (!hasPet) {
        return (
            <div className="profile_info_wrap">
                <div className="profile_name_info">
                    <div className="couple_img">
                         <div className="profile_img_wrap">
                            <div className="ai_generation_wrap">
                                <button type="button" onClick={handleRegister}>
                                    <img src="/assets/images/common/ai_profile_icon.svg" alt="AI 아이콘" />
                                    프로필 생성하기
                                </button>
                            </div>
                         </div>
                          <div className="butler_img pet_img">
                                <img 
                                    src={ownerProfileImage} 
                                    alt="반려인 이미지" 
                                />
                          </div>
                    </div>
                     <strong className="name_txt">망고</strong> {/* Mock name from HTML, or should be '반려동물 이름' or hidden if completely empty? HTML shows '망고' in Not state. I'll use a placeholder */}
                     <div className="count_wrap">
                        <dl><dt>매칭</dt><dd>0</dd></dl>
                        <div></div>
                        <dl><dt>좋아요</dt><dd>0</dd></dl>
                        <div></div>
                        <dl><dt>친구</dt><dd>0</dd></dl>
                    </div>
                </div>

                <div className="guide_box">
                    <p>반려동물 프로필을 등록해 주세요!</p>
                </div>
                
                <ProfileSettingsSection 
                    onEdit={handleRegister} 
                    idPrefix="pet_empty"
                    isNotificationEnabled={user?.isNotificationEnabled}
                    onNotificationChange={handleNotificationChange} 
                />
            </div>
        );
    }

    // HAS PET STATE (Matches profile_pet_info.html)
    return (
        <div className="profile_info_wrap">
             <div className="profile_name_info">
                <ProfileImageSlider 
                    className="couple_img"
                    swiperWrapperClass="profile_img_wrap"
                    images={pet?.profileImageUrls && pet.profileImageUrls.length > 0 
                        ? pet.profileImageUrls 
                        : [pet?.profileImageUrl || "/assets/images/common/pet_none_img.svg"]}
                    secondaryImage={ownerProfileImage}
                    secondaryImageClass="butler_img pet_img"
                    innerChildren={
                        <>
                            <div className="swiper-pet-prev"></div>
                            <div className="swiper-pet-next"></div>
                        </>
                    }
                    navigation={true}
                />
                <strong className="name_txt">{pet?.name}</strong>
                <div className="count_wrap">
                    <dl>
                        <dt>매칭</dt>
                        <dd>128</dd>
                    </dl>
                    <div></div>
                    <dl>
                        <dt>좋아요</dt>
                        <dd>2.4K</dd>
                    </dl>
                    <div></div>
                    <dl>
                        <dt>친구</dt>
                        <dd>48</dd>
                    </dl>
                </div>
            </div>

            <div className="profile_info_box">
                <strong>기본 정보</strong>
                 <div className="box_wrap pink_color">
                    <dl>
                        <dt>나이</dt>
                        <dd>{pet?.birthDate ? `${new Date().getFullYear() - new Date(pet.birthDate).getFullYear() + 1}세` : '-'}</dd>
                    </dl>
                    <dl>
                        <dt>성별</dt>
                        <dd>{pet?.gender === 'MALE' ? '남아' : pet?.gender === 'FEMALE' ? '여아' : '-'}</dd>
                    </dl>
                    <dl>
                        <dt>중성화</dt>
                        <dd>{pet?.isNeutered ? '완료' : '안함'}</dd>
                    </dl>
                    <dl>
                        <dt>품종</dt>
                        <dd>{pet?.breed || pet?.species || '-'}</dd>
                    </dl>
                </div>

                <strong>성향</strong>
                {renderAttributeSection('TRAIT', 'purple_color')}

                <strong>관심사</strong>
                {renderAttributeSection('INTEREST', 'green_color')}

                <strong>알러지 정보</strong>
                {renderAttributeSection('ALLERGY', 'blue_color')}
            </div>
            
            <ProfileSettingsSection 
                onEdit={handleEdit} 
                idPrefix="pet" 
                isNotificationEnabled={user?.isNotificationEnabled}
                onNotificationChange={handleNotificationChange}
            />
        </div>
    );
};

export default ProfilePetTab;
