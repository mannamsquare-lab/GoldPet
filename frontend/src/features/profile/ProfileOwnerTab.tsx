import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petService } from '../../services/petService';
import { userService } from '../../services/userService';
import { goldService } from '../../services/goldService';
import { ProfileImageSlider } from '../../components/common/ProfileImageSlider';
import { ProfileSettingsSection } from './components/ProfileSettingsSection';

const ProfileOwnerTab: React.FC = () => {
    const { user: authUser, updateUser } = useAuthStore();
    const navigate = useNavigate();

    // Fetch user data from API (uses default staleTime, invalidated after profile update)
    const { data: apiUser, isLoading: isUserLoading } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: userService.getMe,
    });

    // Merge API data with auth store (API data takes precedence)
    const user = apiUser || authUser;

    // Fetch My Pet for Secondary Image
    const { data: myPets } = useQuery({ queryKey: ['pets', 'my'], queryFn: petService.getMyPets });
    const representativePet = myPets && myPets.length > 0 ? myPets[0] : null;

    // Fetch gold balance
    const { data: goldBalance } = useQuery({
        queryKey: ['gold', 'balance'],
        queryFn: goldService.getBalance,
    });

    // Mock counts for now as they are not in User store yet
    const counts = {
        matching: 128,
        likes: '2.4K',
        friends: 48
    };

    if (isUserLoading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (!user) {
        return <div>로그인이 필요합니다.</div>;
    }

    const handleNotificationChange = async (enabled: boolean) => {
        if (!user) return;
        
        try {
            const updatedUser = await userService.updateNotification(enabled);
            updateUser(updatedUser);
        } catch (error) {
            console.error('Failed to update notification setting:', error);
            throw error; // Re-throw to let ProfileSettingsSection handle UI revert
        }
    };

    const handleEdit = () => {
        navigate('/profile/owner/edit');
    };

    return (
        <div className="profile_info_wrap">
            <div className="profile_name_info">
                <ProfileImageSlider
                    className="couple_img"
                    swiperWrapperClass="profile_img_wrap"
                    images={user.profileImageUrls && user.profileImageUrls.length > 0 
                        ? user.profileImageUrls 
                        : [user.profileImageUrl || "/assets/images/common/profile_none_img.svg"]}
                    secondaryImage={representativePet?.profileImageUrl || "/assets/images/common/pet_none_img.svg"}
                    secondaryImageClass="butler_img pet_img"
                    navigation={true}
                    innerChildren={
                        <>
                            <div className="swiper-pet-prev"></div>
                            <div className="swiper-pet-next"></div>
                        </>
                    }
                />
                <strong className="name_txt">{user.nickname}</strong>
                <div className="count_wrap">
                    <dl>
                        <dt>매칭</dt>
                        <dd>{counts.matching}</dd>
                    </dl>
                    <div></div>
                    <dl>
                        <dt>좋아요</dt>
                        <dd>{counts.likes}</dd>
                    </dl>
                    <div></div>
                    <dl>
                        <dt>친구</dt>
                        <dd>{counts.friends}</dd>
                    </dl>
                </div>
            </div>

            {/* Gold Balance */}
            <div className="gold-balance-link" onClick={() => navigate('/gold')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'var(--color-bg)', borderRadius: '4.44vw', padding: '4.44vw',
                margin: '4.44vw 0', cursor: 'pointer'
            }}>
                <span style={{ fontSize: '14px', color: '#727272' }}>보유 골드</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {goldBalance?.balance?.toLocaleString() || '0'}G
                </span>
            </div>

            <div className="profile_info_box">
                <strong>기본 정보</strong>
                <div className="box_wrap pink_color">
                    <dl>
                        <dt>이름</dt>
                        <dd>{user.name || '-'}</dd> 
                    </dl>
                    <dl>
                        <dt>닉네임</dt>
                        <dd>{user.nickname}</dd>
                    </dl>
                    <dl>
                        <dt>생년월일</dt>
                        <dd>{user.birthDate || '-'}</dd>
                    </dl>
                    <dl>
                        <dt>휴대폰 번호</dt>
                        <dd>{user.phoneNumber || '-'}</dd>
                    </dl>
                    <dl>
                        <dt>성별</dt>
                        <dd>{user.gender === 'MALE' ? '남성' : user.gender === 'FEMALE' ? '여성' : '-'}</dd>
                    </dl>
                     {/* Age calculation or mocked */}
                    <dl>
                        <dt>나이</dt>
                        <dd>
                            {user.birthDate && user.birthDate.length >= 4 
                                ? `${new Date().getFullYear() - parseInt(user.birthDate.substring(0, 4), 10) + 1}세` 
                                : (user.birthYear ? `${new Date().getFullYear() - user.birthYear + 1}세` : '-')}
                        </dd>
                    </dl>
                    <dl className="full_w">
                        <dt>반려동물 유무</dt>
                        <dd>있음</dd>
                    </dl>
                    <dl className="full_w">
                        <dt>간단한 자기소개</dt>
                        <dd>{user.intro || '-'}</dd>
                    </dl>
                </div>

                <strong>추가 정보</strong>
                <div className="box_wrap purple_color">
                    <dl>
                        <dt>MBTI</dt>
                        <dd>{user.mbti || '-'}</dd>
                    </dl>
                    <dl>
                         <dt>관심사</dt>
                         <dd>{user.interests?.join(', ') || '-'}</dd>
                    </dl>
                     <dl className="full_w">
                        <dt>취미</dt>
                        <dd>{user.hobbies?.join(', ') || '-'}</dd>
                    </dl>
                </div>
            </div>

            <ProfileSettingsSection 
                onEdit={handleEdit} 
                idPrefix="owner" 
                isNotificationEnabled={user.isNotificationEnabled}
                onNotificationChange={handleNotificationChange}
            />
        </div>
    );
};

export default ProfileOwnerTab;
