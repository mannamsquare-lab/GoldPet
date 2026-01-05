import { Swiper, SwiperSlide } from 'swiper/react';
import { Parallax, Navigation } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services/homeService';

import { Loading } from '../../components/common/Loading';
import { LocationStatus } from '../../components/common/LocationStatus';

export default function HomePage() {
    const { data: homeData, isLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: homeService.getHomeData,
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!homeData) return null;

    return (
        <div id="mainContainer">
            <LocationStatus>
                나에게 호감 있는 친구들이에요. <br />
                ‘조하멍' 선택하고 대화 나눠보세요.
            </LocationStatus>
            
            <Swiper
                modules={[Parallax, Navigation]}
                parallax={true}
                speed={600}
                className="main_slide"
                // Simulate Nunjucks loop for recommendations
            >
                {/* Fallback/Mock data if homeData is empty for visualization, or map real data */}
                {homeData.recommendations && homeData.recommendations.length > 0 ? (
                    homeData.recommendations.map((item, index) => (
                        <SwiperSlide key={item.id}>
                            <div className="img_wrap">
                                {/* 사진 상단 왼쪽 아이콘 */}
                                <img src={`/assets/images/main/main_slide_icon0${(index % 3) + 1}.svg`} data-swiper-parallax="-500" className="icon_img" alt="" />
                                
                                {/* 메인 반려동물 이미지 (Nested Swiper) */}
                                <div className="main_slide_inside">
                                    <Swiper
                                        nested={true}
                                        modules={[Navigation]}
                                        navigation={{
                                            prevEl: `.swiper-inside-prev-${item.id}`,
                                            nextEl: `.swiper-inside-next-${item.id}`,
                                        }}
                                        className="swiper-wrapper" // Note: Swiper/React adds swiper-wrapper automatically, but checking if class is needed on container
                                    >
                                        {/* If item has distinct images, use them. Otherwise repeat one for demo */}
                                        {item.images.length > 0 ? item.images.map((img, i) => (
                                            <SwiperSlide key={i}><img src={img} className="pet_img" alt="" /></SwiperSlide>
                                        )) : (
                                            <>
                                                <SwiperSlide><img src={`/assets/images/main/main_slide_img0${(index % 3) + 1}.png`} className="pet_img" alt="" /></SwiperSlide>
                                                <SwiperSlide><img src={`/assets/images/main/main_slide_img0${(index % 3) + 1}.png`} className="pet_img" alt="" /></SwiperSlide>
                                                <SwiperSlide><img src={`/assets/images/main/main_slide_img0${(index % 3) + 1}.png`} className="pet_img" alt="" /></SwiperSlide>
                                            </>
                                        )}
                                    </Swiper>
                                    <div className={`swiper-inside-prev swiper-inside-prev-${item.id}`}></div>
                                    <div className={`swiper-inside-next swiper-inside-next-${item.id}`}></div>
                                </div>

                                {/* 사진 하단 오른쪽 집사 이미지 */}
                                <div className="butler_img" data-swiper-parallax="-400">
                                    <img src={`/assets/images/main/main_slide_butler0${(index % 3) + 1}.jpg`} alt="집사 이미지" onError={(e) => {e.currentTarget.src = '/assets/images/main/main_slide_butler01.jpg'}}/>
                                </div>
                            </div>

                            <div className="txt_wrap" data-swiper-parallax="-200">
                                <h2>{item.name} <img src={item.gender === 'FEMALE' ? "/assets/images/main/woman_icon.svg" : "/assets/images/main/man_icon.svg"} alt="성별 icon" /></h2>
                                {/* neutering_on 붙이면 중성화 ok 노출 */}
                                {item.isNeutered && <p className="neutering_on">중성화 OK</p>}
                            </div>

                            <div className="pet_detail">
                                <p data-swiper-parallax="-300">
                                    {item.description} <br />
                                    서울 강남구 ∙ {item.distance}
                                </p>
                                {/* class 없으면 default, active 추가 하면 좋아요 */}
                                <div className="like_wrap" data-swiper-parallax="-200">
                                    <button type="button">싫어요</button>
                                    <button type="button" className="active">좋아요</button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    // Explicit Static Slides from Nunjucks for exact matching if data is empty
                    <SwiperSlide>
                         <div className="img_wrap">
                            <img src="/assets/images/main/main_slide_icon01.svg" data-swiper-parallax="-500" className="icon_img" alt="" />
                            <div className="main_slide_inside">
                                <Swiper nested={true} modules={[Navigation]} navigation={{ prevEl: '.prev-1', nextEl: '.next-1' }}>
                                    <SwiperSlide><img src="/assets/images/main/main_slide_img01.png" className="pet_img" alt="" /></SwiperSlide>
                                </Swiper>
                                <div className="swiper-inside-prev prev-1"></div>
                                <div className="swiper-inside-next next-1"></div>
                            </div>
                            <div className="butler_img" data-swiper-parallax="-400">
                                <img src="/assets/images/main/main_slide_butler01.jpg" alt="집사 이미지" />
                            </div>
                        </div>
                        <div className="txt_wrap" data-swiper-parallax="-200">
                            <h2>멍텅구리 <img src="/assets/images/main/woman_icon.svg" alt="여자 icon" /></h2>
                             <p>중성화 OK</p>
                        </div>
                        <div className="pet_detail">
                             <p data-swiper-parallax="-300">5개월 ∙ 코숏 치즈 <br />서울 강남구 ∙ 1km 이내</p>
                             <div className="like_wrap" data-swiper-parallax="-200">
                                 <button type="button">싫어요</button>
                                 <button type="button" className="active">좋아요</button>
                             </div>
                        </div>
                    </SwiperSlide>
                )}
            </Swiper>

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
            <section className="walk_wrap">
                <div className="tit_wrap">
                    <h2>산책 기록을 남겨보세요</h2>
                    <p><img src="/assets/images/main/time_icon.svg" alt="시간 icon" />3일 20시간 전</p>
                </div>
                <div className="txt_wrap">
                    <div className="img_wrap">
                        <img src="/assets/images/main/walk_img.jpg" alt="" />
                    </div>
                    <p>
                        🐶 <span>멍텅구리</span>와 <br />
                        📍️ <span>안돌이지돌이다래미한숨바우</span>에서 <br />
                        📏 <span>3km</span> 산책하셨네요.
                    </p>
                </div>
            </section>
        </div>
    );
}
