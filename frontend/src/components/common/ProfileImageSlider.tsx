import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { getImageUrl } from '../../utils/imageUrl';

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
    navigation?: boolean;
}

const isSvg = (src: string) => src.endsWith('.svg');

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

    // Single image: render directly without Swiper
    const useDirect = images.length <= 1;
    const singleImage = images[0] || "/assets/images/main/main_slide_img01.png";

    // For direct rendering: SVG uses background-image (iOS WKWebView compat), others use <img>
    const directContent = isSvg(singleImage) ? (
        <div
            className="pet_img"
            onClick={onImageClick}
            role="img"
            aria-label="프로필 이미지"
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${singleImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        />
    ) : (
        <img
            src={getImageUrl(singleImage, 'medium')}
            className="pet_img"
            alt="프로필 이미지"
            onClick={onImageClick}
            loading="lazy"
            onError={(e) => {
                if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = 'true';
                    e.currentTarget.src = singleImage;
                }
            }}
        />
    );

    const swiperContent = (
        <Swiper
            className="swiper-wrapper"
            modules={modules}
            navigation={swiperProps?.navigation || defaultNavigationConfig}
            style={{ height: '100%' }}
            {...swiperProps}
        >
            {images.map((img, index) => (
                <SwiperSlide key={index} className="swiper-slide">
                    <img
                        src={getImageUrl(img, 'medium')}
                        className="pet_img"
                        alt={`슬라이드 이미지 ${index + 1}`}
                        onClick={onImageClick}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                        onError={(e) => {
                            if (!e.currentTarget.dataset.fallback) {
                                e.currentTarget.dataset.fallback = 'true';
                                e.currentTarget.src = img;
                            }
                        }}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );

    const imageContent = useDirect ? directContent : swiperContent;

    return (
        <div className={className}>
            {children}
            {swiperWrapperClass ? (
                <div className={swiperWrapperClass}>
                    {imageContent}
                    {!useDirect && innerChildren}
                </div>
            ) : (
                <>
                    {imageContent}
                    {!useDirect && innerChildren}
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
