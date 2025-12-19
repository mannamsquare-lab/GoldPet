import { Swiper, SwiperSlide } from 'swiper/react';
import { Parallax, Navigation } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import { homeService } from '../../services/homeService';

export default function HomePage() {
    const { data: homeData, isLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: homeService.getHomeData,
    });

    if (isLoading) {
        return <div className="loading">Loading...</div>; // Or a skeleton
    }

    if (!homeData) return null;

    return (
        <div id="mainContainer">
            <div className="talk_wrap">
                <p>
                    {homeData.user.nickname}님에게 호감 있는 친구들이에요. <br />
                    ‘조하멍' 선택하고 대화 나눠보세요.
                </p>
                <button type="button" className="btn-effect"><img src="/assets/images/common/pin_icon.svg" alt="지도 마커" />서울 강남구</button>
            </div>

            <Swiper
                modules={[Parallax, Navigation]}
                parallax={true}
                speed={600}
                className="main_slide"
            >
                {homeData.recommendations?.map((item, index) => (
                    <SwiperSlide key={item.id}>
                        <div className="img_wrap">
                           {/* Icon based on index or type? Random for now */}
                            <img src={`/assets/images/main/main_slide_icon0${(index % 3) + 1}.svg`} data-swiper-parallax="-500" className="icon_img" alt="" />
                            
                            <div className="main_slide_inside">
                                <Swiper
                                     nested={true}
                                     modules={[Navigation]}
                                     className="inner_swiper"
                                     navigation={{
                                         prevEl: `.swiper-inside-prev-${item.id}`,
                                         nextEl: `.swiper-inside-next-${item.id}`,
                                     }}
                                >
                                    {item.images.map((img, i) => (
                                        <SwiperSlide key={i}><img src={img} className="pet_img" alt="" /></SwiperSlide>
                                    ))}
                                </Swiper>
                                <div className={`swiper-inside-prev swiper-inside-prev-${item.id}`}></div>
                                <div className={`swiper-inside-next swiper-inside-next-${item.id}`}></div>
                            </div>

                            <div className="butler_img" data-swiper-parallax="-400">
                                {/* Use mock butler image if not in data, or static for now */}
                                <img src={`/assets/images/main/main_slide_butler0${(index % 3) + 1}.png`} alt="집사 이미지" onError={(e) => e.currentTarget.src = '/assets/images/main/main_slide_butler01.jpg'} />
                            </div>
                        </div>
                        <div className="txt_wrap" data-swiper-parallax="-200">
                            <h2>{item.name} <img src={item.gender === 'FEMALE' ? "/assets/images/main/woman_icon.svg" : "/assets/images/main/man_icon.svg"} alt="성별 icon" /></h2>
                            {item.isNeutered && <p className="neutering_on">중성화 OK</p>}
                        </div>
                        <div className="pet_detail">
                            <p data-swiper-parallax="-300">
                                {item.description} <br />
                                서울 강남구 ∙ {item.distance}
                            </p>
                            <div className="like_wrap" data-swiper-parallax="-200">
                                <button type="button" className="btn-effect">싫어요</button>
                                <button type="button" className="active btn-effect">좋아요</button>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <section className="ai_profile_banner">
                <a href="">
                    <img src="/assets/images/main/ai_banner_img.png" alt="블러 처리된 사진" />
                    <div className="txt_wrap">
                        <h2>아직 AI 프로필이 없으시네요?</h2>
                        <p>{homeData.pet?.name || '멍멍이'}의 다양한 모습을 지금 만나 보세요!</p>
                    </div>
                </a>
            </section>

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
                        🐶 <span>{homeData.pet?.name}</span>와 <br />
                        📍️ <span>안돌이지돌이다래미한숨바우</span>에서 <br />
                        📏 <span>3km</span> 산책하셨네요.
                    </p>
                </div>
            </section>
        </div>
    );
}
