import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { userService } from '../../services/userService';
import { petService } from '../../services/petService';
import { goldService } from '../../services/goldService';
import { CACHE_TIME } from '../../config/queryConfig';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import { ProfileImageSlider } from '../../components/common/ProfileImageSlider';
import './MyPage.css';

const ChevronRight = () => (
  <svg className="mypage-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const GoldCoinIcon = () => (
  <img className="mypage-gold-coin" src="/assets/images/common/gold_icon.svg" alt="골드" />
);

const GenderIcon: React.FC<{ gender?: 'MALE' | 'FEMALE' }> = ({ gender }) => {
  if (!gender) return null;
  if (gender === 'FEMALE') {
    return (
      <svg className="mypage-pet-gender-icon female" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="6" r="4" stroke="#FF69B4" strokeWidth="1.5" />
        <line x1="8" y1="10" x2="8" y2="15" stroke="#FF69B4" strokeWidth="1.5" />
        <line x1="6" y1="13" x2="10" y2="13" stroke="#FF69B4" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg className="mypage-pet-gender-icon male" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="9" r="4" stroke="#4A90D9" strokeWidth="1.5" />
      <line x1="10" y1="6" x2="14" y2="2" stroke="#4A90D9" strokeWidth="1.5" />
      <line x1="11" y1="2" x2="14" y2="2" stroke="#4A90D9" strokeWidth="1.5" />
      <line x1="14" y1="2" x2="14" y2="5" stroke="#4A90D9" strokeWidth="1.5" />
    </svg>
  );
};

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();

  const { data: apiUser } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: userService.getMe,
    ...CACHE_TIME.DYNAMIC,
  });

  const { data: myPets } = useQuery({
    queryKey: ['pets', 'my'],
    queryFn: petService.getMyPets,
    ...CACHE_TIME.DYNAMIC,
  });

  const { data: goldBalance } = useQuery({
    queryKey: ['gold', 'balance'],
    queryFn: goldService.getBalance,
    ...CACHE_TIME.DYNAMIC,
  });

  const { data: stats } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => userService.getMyStats(),
    ...CACHE_TIME.DYNAMIC,
  });

  const formatCount = (n: number): string => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  const user = apiUser || authUser;

  const profileImages = user?.profileImageUrls?.length
    ? user.profileImageUrls
    : [user?.profileImageUrl || '/assets/images/common/profile_none_img.svg'];

  const settingsButton = (
    <button
      type="button"
      onClick={() => navigate('/settings')}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    </button>
  );

  const menuItems = [
    { label: '내 산책 기록', path: '/walk' },
    { label: '뱃지 & 미션', path: '/my-badges' },
    { label: '내가 쓴 글', path: '/mypage/posts' },
    { label: '차단 관리', path: '/block-management' },
  ];

  return (
    <SubPageLayout title="마이페이지" rightAction={settingsButton}>
      <div className="mypage-container">
        {/* Profile Section */}
        <div className="mypage-profile">
          {/* Photo Slider — reuse ProfileImageSlider for consistent sizing */}
          <div className="mypage-photo-slider">
            <ProfileImageSlider
              className="mypage-couple-img"
              swiperWrapperClass="mypage-img-wrap"
              images={profileImages}
              navigation={true}
              innerChildren={
                <>
                  <div className="swiper-pet-prev"></div>
                  <div className="swiper-pet-next"></div>
                </>
              }
            />
          </div>

          {/* Nickname */}
          <div className="mypage-nickname">{user?.nickname || '사용자'}</div>

          {/* Stats */}
          <div className="mypage-stats">
            <dl className="mypage-stats-item">
              <dt>매칭</dt>
              <dd>{formatCount(stats?.matchingCount ?? 0)}</dd>
            </dl>
            <div className="mypage-stats-divider" />
            <dl className="mypage-stats-item">
              <dt>좋아요</dt>
              <dd>{formatCount(stats?.likesCount ?? 0)}</dd>
            </dl>
            <div className="mypage-stats-divider" />
            <dl className="mypage-stats-item">
              <dt>친구</dt>
              <dd>{formatCount(stats?.friendsCount ?? 0)}</dd>
            </dl>
          </div>
        </div>

        {/* Gold Section */}
        <div className="mypage-gold-section">
          <div className="mypage-section-title">보유 골드</div>
          <div className="mypage-gold-card">
            <div className="mypage-gold-amount">
              <GoldCoinIcon />
              <span className="mypage-gold-value">
                {(goldBalance?.balance || 0).toLocaleString()}
              </span>
            </div>
            <button className="mypage-gold-charge-btn" onClick={() => navigate('/gold/purchase')}>
              충전
            </button>
          </div>
        </div>

        {/* Pet Section */}
        <div className="mypage-pet-section">
          <div className="mypage-pet-header">
            <div className="mypage-section-title" style={{ padding: 0 }}>나의 반려동물</div>
            <button className="mypage-pet-add" onClick={() => navigate('/profile/pet/edit')}>+ 추가</button>
          </div>
          {myPets && myPets.length > 0 ? (
            <div className="mypage-pet-list">
              {myPets.map((pet) => (
                <div key={pet.id} className="mypage-pet-card" onClick={() => navigate('/profile/pet/edit')}>
                  <img
                    className="mypage-pet-photo"
                    src={pet.profileImageUrl || '/assets/images/common/pet_none_img.svg'}
                    alt={pet.name}
                  />
                  <div className="mypage-pet-info">
                    <div className="mypage-pet-name-row">
                      <span className="mypage-pet-name">{pet.name}</span>
                      <GenderIcon gender={pet.gender} />
                    </div>
                    {pet.isNeutered && <span className="mypage-pet-neutered">중성화 OK</span>}
                    {pet.breed && <span className="mypage-pet-breed">{pet.breed}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mypage-pet-empty">
              <span>등록된 반려동물이 없습니다</span>
              <button
                className="mypage-gold-charge-btn"
                style={{ width: 'auto', padding: '0 24px' }}
                onClick={() => navigate('/profile/pet/edit')}
              >
                등록하기
              </button>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <div className="mypage-menu-section">
          {menuItems.map((item) => (
            <div key={item.label} className="mypage-menu-item" onClick={() => navigate(item.path)}>
              <span>{item.label}</span>
              <ChevronRight />
            </div>
          ))}

          {/* Profile Edit */}
          <div className="mypage-menu-item" onClick={() => navigate('/profile')}>
            <span>프로필 수정</span>
            <ChevronRight />
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
};

export default MyPage;
