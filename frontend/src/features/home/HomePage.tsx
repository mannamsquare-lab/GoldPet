import { useEffect, useRef, useState } from 'react';
import SwiperCore from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Parallax } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services/homeService';
import { friendService, formatPetTag } from '../../services/friendService';
import { noticeService } from '../../services/noticeService';
import type { AppNoticeResponse } from '../../services/noticeService';
import { useAlert } from '../../contexts/AlertContext';
import { CACHE_TIME } from '../../config/queryConfig';
import { getImageUrl } from '../../utils/imageUrl';
import { ImageGalleryModal } from '../../components/common/ImageGalleryModal';

import { Loading } from '../../components/common/Loading';
import { LocationStatus } from '../../components/common/LocationStatus';
import NoticePopupModal from '../../components/common/NoticePopupModal';
import MaintenanceBanner from '../../components/common/MaintenanceBanner';
import EventBanner from '../../components/common/EventBanner';

const OWNER_FALLBACK = '/assets/images/common/profile_none_img.svg';
const PET_FALLBACK_FN = (index: number) =>
    `/assets/images/main/main_slide_img0${(index % 3) + 1}.png`;

function formatTimeAgo(endTime: string): string {
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = now.getTime() - end.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diffDays > 0) return `${diffDays}일 ${diffHours}시간 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return '방금 전';
}

export default function HomePage() {
    const mainSlideRef = useRef<HTMLDivElement>(null);
    const mainSwiperRef = useRef<SwiperCore | null>(null);
    const { showAlert } = useAlert();
    const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
    const [, setHiddenIds] = useState<Set<number>>(new Set());
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [notices, setNotices] = useState<AppNoticeResponse[]>([]);
    const [maintenanceNotice, setMaintenanceNotice] = useState<AppNoticeResponse | null>(null);
    const [petModeMap, setPetModeMap] = useState<Record<number, boolean>>({});
    const [galleryState, setGalleryState] = useState<{
        open: boolean; images: string[]; index: number;
    }>({ open: false, images: [], index: 0 });

    const isPetMode = (id: number) => petModeMap[id] !== false;
    const toggleMode = (id: number) =>
        setPetModeMap(prev => ({ ...prev, [id]: !(prev[id] !== false) }));

    const handleLike = async (id: number, name: string) => {
        if (loadingId) return;
        setLoadingId(id);
        try {
            const result = await friendService.likeUser(id);
            setLikedIds(prev => new Set(prev).add(id));
            if (result.isMutual) {
                showAlert(`${name}과 서로 좋아해가 되었어요! 💕`);
            } else {
                showAlert(`${name}에게 좋아요를 보냈어요! ❤️`);
            }
        } catch {
            showAlert('좋아요를 보내는데 실패했습니다.');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDislike = async (id: number, name: string) => {
        if (loadingId) return;
        setLoadingId(id);
        try {
            await friendService.unlikeUser(id);
            setHiddenIds(prev => new Set(prev).add(id));
            showAlert(`${name}님을 패스했어요 🙅`);
            // Slide to next after dislike
            mainSwiperRef.current?.slideNext();
        } catch {
            showAlert('작업에 실패했습니다.');
        } finally {
            setLoadingId(null);
        }
    };

    useEffect(() => {
        const loadNotices = async () => {
            try {
                const [activeNotices, maintenance] = await Promise.all([
                    noticeService.getActiveNotices('home'),
                    noticeService.getMaintenanceNotice(),
                ]);
                setNotices(activeNotices);
                setMaintenanceNotice(maintenance);
            } catch (e) {
                console.warn('Notice loading failed:', e);
            }
        };
        loadNotices();
    }, []);

    const { data: homeData, isLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: homeService.getHomeData,
        ...CACHE_TIME.DYNAMIC,
    });

    useEffect(() => {
        if (!homeData || !mainSlideRef.current) return;

        // Initialize outer Swiper (main slide) - identical to original design_common.js
        mainSwiperRef.current = new SwiperCore(mainSlideRef.current, {
            modules: [Parallax],
            loop: false,
            parallax: true,
            spaceBetween: '5%',
        });

        return () => {
            mainSwiperRef.current?.destroy(true, true);
        };
    }, [homeData]);

    if (isLoading) {
        return <Loading />;
    }

    if (!homeData) return null;

    return (
        <div id="mainContainer">
            {maintenanceNotice && <MaintenanceBanner notice={maintenanceNotice} />}
            <NoticePopupModal notices={notices} />
            <LocationStatus>
                나에게 호감 있는 친구들이에요. <br />
                '조하멍' 선택하고 대화 나눠보세요.
            </LocationStatus>

            {/* Vanilla Swiper outer - HTML structure identical to original index.html */}
            <div className="main_slide" ref={mainSlideRef}>
                <div className="swiper-wrapper">
                    {homeData.recommendations && homeData.recommendations.length > 0 ? (
                        homeData.recommendations.map((item, index) => {
                            const petMode = isPetMode(item.id);
                            const currentImages = petMode
                                ? (item.images.length > 0 ? item.images : [PET_FALLBACK_FN(index)])
                                : (item.profileImageUrl
                                    ? [item.profileImageUrl]
                                    : [OWNER_FALLBACK]);
                            const butlerSrc = petMode
                                ? (item.profileImageUrl || OWNER_FALLBACK)
                                : (item.images[0] || PET_FALLBACK_FN(index));

                            return (
                                <div className="swiper-slide" key={item.id}>
                                    <div className="img_wrap">
                                        <img src={`/assets/images/main/main_slide_icon0${(index % 3) + 1}.svg`} data-swiper-parallax="-500" className="icon_img" alt="" />

                                        {/* Inner Swiper as React component - avoids vanilla reinit on state change */}
                                        <div className="main_slide_inside">
                                            <Swiper
                                                modules={[Navigation]}
                                                navigation={{
                                                    prevEl: `.swiper-inside-prev-${index}`,
                                                    nextEl: `.swiper-inside-next-${index}`,
                                                }}
                                                loop={false}
                                                spaceBetween={0}
                                                allowTouchMove={false}
                                                key={petMode ? `pet-${item.id}` : `owner-${item.id}`}
                                            >
                                                {currentImages.map((img, imgIdx) => (
                                                    <SwiperSlide key={imgIdx}>
                                                        <img
                                                            className="pet_img"
                                                            src={getImageUrl(img, 'medium')}
                                                            alt=""
                                                            data-clickable="true"
                                                            loading="lazy"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setGalleryState({ open: true, images: currentImages, index: imgIdx });
                                                            }}
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                if (!target.dataset.fallback) {
                                                                    target.dataset.fallback = 'true';
                                                                    target.src = img;
                                                                }
                                                            }}
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                            <div className={`swiper-inside-prev-${index} swiper-inside-prev`}></div>
                                            <div className={`swiper-inside-next-${index} swiper-inside-next`}></div>
                                        </div>

                                        <div
                                            className="butler_img"
                                            data-swiper-parallax="-400"
                                            data-clickable="true"
                                            onClick={(e) => { e.stopPropagation(); toggleMode(item.id); }}
                                        >
                                            <img
                                                src={butlerSrc}
                                                alt=""
                                                onError={(e) => { e.currentTarget.src = OWNER_FALLBACK; }}
                                            />
                                        </div>
                                    </div>

                                    <div className="txt_wrap" data-swiper-parallax="-200">
                                        {petMode ? (
                                            <h2>
                                                {item.name}{' '}
                                                <img
                                                    src={item.gender === 'FEMALE'
                                                        ? '/assets/images/main/woman_icon.svg'
                                                        : '/assets/images/main/man_icon.svg'}
                                                    alt="성별 icon"
                                                />
                                            </h2>
                                        ) : (
                                            <h2>{item.nickname}</h2>
                                        )}
                                        {petMode && item.isNeutered && <p className="neutering_on">중성화 OK</p>}
                                    </div>

                                    <div className="pet_detail">
                                        {petMode ? (
                                            <>
                                                <p data-swiper-parallax="-300">
                                                    {item.petAge}살 ∙ {item.petBreed} <br />
                                                    {item.locationText || '위치 미설정'} ∙ {item.distance}
                                                </p>
                                                <br />
                                                {item.description && <p data-swiper-parallax="-250">{item.description}</p>}
                                            </>
                                        ) : (
                                            <p data-swiper-parallax="-300">
                                                {item.locationText || '위치 미설정'} ∙ {item.distance}
                                            </p>
                                        )}
                                        {item.tags.length > 0 && (
                                            <div className="wish_dot" data-swiper-parallax="-200">
                                                {item.tags
                                                    .map(tag => formatPetTag(tag))
                                                    .filter(tag => tag !== '')
                                                    .map((tag, i) => (
                                                        <p key={i} className={`label${(i % 4) + 1}`}>{tag}</p>
                                                    ))
                                                }
                                            </div>
                                        )}
                                        <div className="like_wrap" data-swiper-parallax="-150">
                                            <button type="button" onClick={() => handleDislike(item.id, item.name)} disabled={loadingId === item.id}>
                                                <img src="/assets/images/common/dislike_btn.svg" alt="" />싫어요
                                            </button>
                                            <button type="button" className="active" onClick={() => handleLike(item.id, item.name)} disabled={loadingId === item.id || likedIds.has(item.id)}>
                                                <img src="/assets/images/common/like_btn.svg" alt="" />{likedIds.has(item.id) ? '좋아요 완료' : '좋아요'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="swiper-slide">
                            <div className="img_wrap">
                                <img src="/assets/images/main/main_slide_icon01.svg" data-swiper-parallax="-500" className="icon_img" alt="" />
                                <div className="main_slide_inside">
                                    <Swiper modules={[Navigation]} loop={false} allowTouchMove={false}>
                                        <SwiperSlide>
                                            <img src="/assets/images/common/pet_none_img02.svg" className="pet_img" alt="" />
                                        </SwiperSlide>
                                    </Swiper>
                                </div>
                            </div>
                            <div className="txt_wrap" data-swiper-parallax="-200">
                                <h2>아직 추천 친구가 없어요</h2>
                            </div>
                            <div className="pet_detail">
                                <p data-swiper-parallax="-300">주변 반려동물 친구를 찾아보세요!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ImageGalleryModal
                isOpen={galleryState.open}
                images={galleryState.images}
                initialIndex={galleryState.index}
                onClose={() => setGalleryState(s => ({ ...s, open: false }))}
            />

            <EventBanner notices={notices} />

            {/* 중간 배너 */}
            <section className="ai_profile_banner">
                <a href="">
                    <img src="/assets/images/main/ai_banner_img.png" alt="블러 처리된 사진" />
                    <div className="txt_wrap">
                        <h2>아직 AI 프로필이 없으시네요?</h2>
                        <p>멍텅구리의 다양한 모습을 지금 만나 보세요!</p>
                    </div>
                </a>
            </section>

            {/* 산책 기록 */}
            {homeData.recentWalk ? (
                <section className="walk_wrap">
                    <div className="tit_wrap">
                        <h2>산책 기록을 남겨보세요</h2>
                        <p><img src="/assets/images/main/time_icon.svg" alt="시간 icon" />{formatTimeAgo(homeData.recentWalk.endTime)}</p>
                    </div>
                    <div className="txt_wrap">
                        <p>
                            📏 <span>{homeData.recentWalk.distanceKm.toFixed(1)}km</span> 산책했어요.
                        </p>
                    </div>
                </section>
            ) : (
                <section className="walk_wrap">
                    <div className="tit_wrap">
                        <h2>산책 기록을 남겨보세요</h2>
                    </div>
                    <div className="txt_wrap">
                        <p>아직 산책 기록이 없어요. 첫 산책을 시작해보세요!</p>
                    </div>
                </section>
            )}
        </div>
    );
}
