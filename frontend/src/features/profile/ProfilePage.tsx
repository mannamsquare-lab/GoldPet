import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LocationStatus } from '../../components/common/LocationStatus';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import ProfileOwnerTab from './ProfileOwnerTab';
import ProfilePetTab from './ProfilePetTab';

const ProfilePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'owner' | 'pet'>(tabParam === 'pet' ? 'pet' : 'owner');

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
            onClick={() => setActiveTab('owner')}
          >
            반려인
          </button>
          <button
            type="button"
            className={activeTab === 'pet' ? 'active' : ''}
            onClick={() => setActiveTab('pet')}
          >
            반려동물
          </button>
        </div>

        {activeTab === 'owner' ? <ProfileOwnerTab /> : <ProfilePetTab />}
      </div>
    </SubPageLayout>
  );
};

export default ProfilePage;
