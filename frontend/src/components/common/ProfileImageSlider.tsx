import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface ProfileImageSliderProps {
    images: string[];
    secondaryImage?: string;
    secondaryImageClass?: string; // 'butler_img' or 'pet_img'
    onImageClick?: () => void;
    className?: string; // Wrapper class like 'profile_img_wrap'
    swiperWrapperClass?: string;
    children?: React.ReactNode;
    innerChildren?: React.ReactNode;
    swiperProps?: any; 
    navigation?: boolean; // New prop to easily enable navigation
}

export const ProfileImageSlider: React.FC<ProfileImageSliderProps> = ({
    images,
    secondaryImage,
    secondaryImageClass = 'butler_img',
    onImageClick,
    className = 'profile_img_wrap',
    swiperWrapperClass,
    children,
    innerChildren,
    swiperProps,
    navigation = false
}) => {
    const modules = [...(swiperProps?.modules || [])];
    if (navigation) modules.push(Navigation);

    const defaultNavigationConfig = navigation ? {
        prevEl: '.swiper-pet-prev',
        nextEl: '.swiper-pet-next',
    } : {};

    const swiperContent = (
        <Swiper 
            className="swiper-wrapper" 
            modules={modules}
            navigation={swiperProps?.navigation || defaultNavigationConfig}
            {...swiperProps}
        >
            {images.length > 0 ? (
                images.map((img, index) => (
                    <SwiperSlide key={index} className="swiper-slide">
                        <img 
                            src={img} 
                            className="pet_img" 
                            alt={`슬라이드 이미지 ${index + 1}`} 
                            onClick={onImageClick}
                            style={{ width: '100%', objectFit: 'cover' }}
                        />
                    </SwiperSlide>
                ))
            ) : (
                <SwiperSlide className="swiper-slide">
                        <img 
                        src="/assets/images/main/main_slide_img01.png" // Default fallback
                        className="pet_img" 
                        alt="기본 이미지" 
                        style={{ width: '100%', objectFit: 'cover' }}
                    />
                </SwiperSlide>
            )}
        </Swiper>
    );

    return (
        <div className={className}>
            {children}
            {swiperWrapperClass ? (
                <div className={swiperWrapperClass}>
                    {swiperContent}
                    {innerChildren}
                </div>
            ) : (
                <>
                    {swiperContent}
                    {innerChildren}
                </>
            )}
            
            {secondaryImage && (
                <div className={secondaryImageClass}>
                    <img src={secondaryImage} alt="보조 이미지" />
                </div>
            )}
        </div>
    );
};
