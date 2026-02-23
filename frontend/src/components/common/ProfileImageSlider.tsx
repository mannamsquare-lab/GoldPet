import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { getImageUrl } from '../../utils/imageUrl';

interface ProfileImageSliderProps {
    images: string[];
    secondaryImage?: string;
    secondaryImageClass?: string; // 'butler_img' or 'pet_img'
    onImageClick?: () => void;
    onSecondaryImageClick?: () => void;  // callback when small (butler) image is tapped
    onMainImageClick?: (index: number) => void;  // callback when large image is tapped (for gallery open)
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
    onSecondaryImageClick,
    onMainImageClick,
    className = 'profile_img_wrap',
    swiperWrapperClass,
    children,
    innerChildren,
    swiperProps,
    navigation = false
}) => {
    const activeIndexRef = useRef(0);

    const modules = [...(swiperProps?.modules || [])];
    if (navigation) modules.push(Navigation);

    const defaultNavigationConfig = navigation ? {
        prevEl: '.swiper-pet-prev',
        nextEl: '.swiper-pet-next',
    } : {};

    const handleMainImageClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        onImageClick?.();
        onMainImageClick?.(index);
    };

    // Single image: render directly without Swiper
    const useDirect = images.length <= 1;
    const singleImage = images[0] || "/assets/images/main/main_slide_img01.png";

    // For direct rendering: SVG uses background-image (iOS WKWebView compat), others use <img>
    const directContent = isSvg(singleImage) ? (
        <div
            className="pet_img"
            onClick={(e) => handleMainImageClick(e, 0)}
            role="img"
            aria-label="프로필 이미지"
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${singleImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: onMainImageClick ? 'pointer' : undefined,
            }}
        />
    ) : (
        <img
            src={getImageUrl(singleImage, 'medium')}
            className="pet_img"
            alt="프로필 이미지"
            onClick={(e) => handleMainImageClick(e, 0)}
            loading="lazy"
            style={{ cursor: onMainImageClick ? 'pointer' : undefined }}
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
            onSlideChange={(swiper: SwiperType) => {
                activeIndexRef.current = swiper.activeIndex;
                swiperProps?.onSlideChange?.(swiper);
            }}
            {...swiperProps}
        >
            {images.map((img, index) => (
                <SwiperSlide key={index} className="swiper-slide">
                    <img
                        src={getImageUrl(img, 'medium')}
                        className="pet_img"
                        alt={`슬라이드 이미지 ${index + 1}`}
                        onClick={(e) => handleMainImageClick(e, activeIndexRef.current)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: onMainImageClick ? 'pointer' : undefined,
                        }}
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
                <div
                    className={secondaryImageClass}
                    onClick={onSecondaryImageClick ? (e) => { e.stopPropagation(); onSecondaryImageClick(); } : undefined}
                    style={onSecondaryImageClick ? { cursor: 'pointer' } : undefined}
                >
                    <img src={secondaryImage} alt="보조 이미지" />
                </div>
            )}
        </div>
    );
};
