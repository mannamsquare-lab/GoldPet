import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { m } from 'motion/react';
import { LocationStatus } from '../../components/common/LocationStatus';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import { TAB_DURATION, TAB_EASING } from '../../config/cardFlipAnimation';
import ProfileOwnerTab from './ProfileOwnerTab';
import ProfilePetTab from './ProfilePetTab';

const ProfilePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'owner' | 'pet'>(tabParam === 'pet' ? 'pet' : 'owner');
  const isAnimatingRef = useRef(false);

  const handleTabChange = (tab: 'owner' | 'pet') => {
    if (isAnimatingRef.current || tab === activeTab) return;
    isAnimatingRef.current = true;
    setActiveTab(tab);
  };

  return (
    <SubPageLayout title="">
      <div id="profileContainer">
        <LocationStatus className="talk_wrap">
          반려동물과 함께하는 <br />
          행복한 일상을 같이 공유하고 싶어요
        </LocationStatus>

        <div className="group_tab">
          <button
            type="button"
            className={activeTab === 'owner' ? 'active' : ''}
            onClick={() => handleTabChange('owner')}
          >
            반려인
          </button>
          <button
            type="button"
            className={activeTab === 'pet' ? 'active' : ''}
            onClick={() => handleTabChange('pet')}
          >
            반려동물
          </button>
        </div>

        <m.div
          animate={{ opacity: activeTab === 'owner' ? 1 : 0 }}
          transition={{ duration: TAB_DURATION, ease: TAB_EASING }}
          onAnimationComplete={() => { isAnimatingRef.current = false; }}
          style={activeTab === 'owner'
            ? { position: 'relative' as const, width: '100%' }
            : { visibility: 'hidden' as const, pointerEvents: 'none' as const, position: 'absolute' as const, width: '100%' }}
        >
          <ProfileOwnerTab />
        </m.div>
        <m.div
          animate={{ opacity: activeTab === 'pet' ? 1 : 0 }}
          transition={{ duration: TAB_DURATION, ease: TAB_EASING }}
          onAnimationComplete={() => { isAnimatingRef.current = false; }}
          style={activeTab === 'pet'
            ? { position: 'relative' as const, width: '100%' }
            : { visibility: 'hidden' as const, pointerEvents: 'none' as const, position: 'absolute' as const, width: '100%' }}
        >
          <ProfilePetTab />
        </m.div>
      </div>
    </SubPageLayout>
  );
};

export default ProfilePage;
