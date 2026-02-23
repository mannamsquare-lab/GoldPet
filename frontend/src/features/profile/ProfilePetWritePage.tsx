import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainHeader } from '../../components/common/MainHeader';
import { BottomNav } from '../../components/common/BottomNav';
import PetForm from '../pet/PetForm';

const ProfilePetWritePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editPetId = searchParams.get('petId') ? Number(searchParams.get('petId')) : null;

    return (
        <>
            <div id="wrap">
                <MainHeader variant="logo-with-icons" />
                <PetForm
                    petId={editPetId ?? undefined}
                    onSuccess={() => navigate('/profile')}
                    onCancel={() => navigate('/profile?tab=pet')}
                />
                <BottomNav />
            </div>
        </>
    );
};

export default ProfilePetWritePage;
