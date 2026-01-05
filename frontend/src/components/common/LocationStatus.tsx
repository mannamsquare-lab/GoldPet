import React from 'react';

interface LocationStatusProps {
    children: React.ReactNode;
    location?: string;
    className?: string;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({ 
    children, 
    location = '서울 강남구',
    className = ''
}) => {
    return (
        <div className={`talk_wrap ${className}`}>
            <p>{children}</p>
            <button type="button">
                <img src="/assets/images/common/pin_icon.svg" alt="지도 마커" />
                {location}
            </button>
        </div>
    );
};
