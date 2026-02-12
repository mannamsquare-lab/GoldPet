import { useEffect, useRef } from 'react';
import SwiperCore from 'swiper';
import { Navigation, Parallax } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services/homeService';

import { Loading } from '../../components/common/Loading';
import { LocationStatus } from '../../components/common/LocationStatus';

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
    const insideSwiperRefs = useRef<SwiperCore[]>([]);

    const { data: homeData, isLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: homeService.getHomeData,
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

        // Initialize inner Swipers (pet image slides) - identical to original
        const insideSliders = mainSlideRef.current.querySelectorAll<HTMLElement>('.main_slide_inside');
        insideSwiperRefs.current = [];

        insideSliders.forEach((containerEl) => {
            const prevEl = containerEl.querySelector<HTMLElement>('.swiper-inside-prev');
            const nextEl = containerEl.querySelector<HTMLElement>('.swiper-inside-next');

            const swiper = new SwiperCore(containerEl, {
                modules: [Navigation],
                loop: false,
                spaceBetween: 0,
                allowTouchMove: false,
                navigation: {
                    prevEl: prevEl,
                    nextEl: nextEl,
                },
            });
            insideSwiperRefs.current.push(swiper);
        });

        return () => {
            insideSwiperRefs.current.forEach(s => s.destroy(true, true));
            mainSwiperRef.current?.destroy(true, true);
        };
    }, [homeData]);

    if (isLoading) {
        return <Loading />;
    }

    if (!homeData) return null;

    return (
        <div id="mainContainer">
            <LocationStatus>
                나에게 호감 있는 친구들이에요. <br />
                '조하멍' 선택하고 대화 나눠보세요.
            </LocationStatus>

            {/* Vanilla Swiper - HTML structure identical to original index.html */}
            <div className="main_slide" ref={mainSlideRef}>
                <div className="swiper-wrapper">
                    {homeData.recommendations && homeData.recommendations.length > 0 ? (
                        homeData.recommendations.map((item, index) => (
                            <div className="swiper-slide" key={item.id}>
                                <div className="img_wrap">
                                    <img src={`/assets/images/main/main_slide_icon0${(index % 3) + 1}.svg`} data-swiper-parallax="-500" className="icon_img" alt="" />

                                    <div className="main_slide_inside">
                                        <div className="swiper-wrapper">
                                            {item.images.length > 0 ? item.images.map((img, i) => (
                                                <div className="swiper-slide" key={i}><img src={img} className="pet_img" alt="" /></div>
                                            )) : (
                                                <div className="swiper-slide"><img src={`/assets/images/main/main_slide_img0${(index % 3) + 1}.png`} className="pet_img" alt="" /></div>
                                            )}
                                        </div>
                                        <div className="swiper-inside-prev"></div>
                                        <div className="swiper-inside-next"></div>
                                    </div>

                                    <div className="butler_img" data-swiper-parallax="-400">
                                        <img
                                            src={item.profileImageUrl || `/assets/images/main/main_slide_butler0${(index % 3) + 1}.jpg`}
                                            alt="집사 이미지"
                                            onError={(e) => {e.currentTarget.src = '/assets/images/common/profile_none_img.svg'}}
                                        />
                                    </div>
                                </div>

                                <div className="txt_wrap" data-swiper-parallax="-200">
                                    <h2>{item.name} <img src={item.gender === 'FEMALE' ? "/assets/images/main/woman_icon.svg" : "/assets/images/main/man_icon.svg"} alt="성별 icon" /></h2>
                                    {item.isNeutered && <p className="neutering_on">중성화 OK</p>}
                                </div>

                                <div className="pet_detail">
                                    <p data-swiper-parallax="-300">
                                        {item.description} <br />
                                        {item.locationText || '위치 미설정'} ∙ {item.distance}
                                    </p>
                                    <div className="like_wrap" data-swiper-parallax="-200">
                                        <button type="button">싫어요</button>
                                        <button type="button" className="active">좋아요</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="swiper-slide">
                            <div className="img_wrap">
                                <img src="/assets/images/main/main_slide_icon01.svg" data-swiper-parallax="-500" className="icon_img" alt="" />
                                <div className="main_slide_inside">
                                    <div className="swiper-wrapper">
                                        <div className="swiper-slide"><img src="/assets/images/common/pet_none_img02.svg" className="pet_img" alt="" /></div>
                                    </div>
                                    <div className="swiper-inside-prev"></div>
                                    <div className="swiper-inside-next"></div>
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
