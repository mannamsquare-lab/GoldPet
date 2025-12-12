import { Swiper, SwiperSlide } from 'swiper/react';
import { Parallax, Navigation } from 'swiper/modules';

export default function HomePage() {
    return (
        <div id="mainContainer">
            <div className="talk_wrap">
                <p>
                    나에게 호감 있는 친구들이에요. <br />
                    ‘조하멍' 선택하고 대화 나눠보세요.
                </p>
                <button type="button" className="btn-effect"><img src="/assets/images/common/pin_icon.svg" alt="지도 마커" />서울 강남구</button>
            </div>

            <Swiper
                modules={[Parallax]}
                parallax={true}
                speed={600}
                className="main_slide"
            >
                {/* Slide 1 */}
                <SwiperSlide>
                        <div className="img_wrap">
                            <img src="/assets/images/main/main_slide_icon01.svg" data-swiper-parallax="-500" className="icon_img" alt="" />
                            
                            <div className="main_slide_inside">
                                <div className="swiper-wrapper">
                                    <div className="swiper-slide"><img src="/assets/images/main/main_slide_img01.png" className="pet_img" alt="" /></div>
                                    <div className="swiper-slide"><img src="/assets/images/main/main_slide_img01.png" className="pet_img" alt="" /></div>
                                    <div className="swiper-slide"><img src="/assets/images/main/main_slide_img01.png" className="pet_img" alt="" /></div>
                                </div>
                                <div className="swiper-inside-prev"></div>
                                <div className="swiper-inside-next"></div>
                            </div>

                            <div className="butler_img" data-swiper-parallax="-400">
                                <img src="/assets/images/main/main_slide_butler01.jpg" alt="집사 이미지" />
                            </div>
                        </div>
                        <div className="txt_wrap" data-swiper-parallax="-200">
                            <h2>멍텅구리 <img src="/assets/images/main/woman_icon.svg" alt="여자 icon" /></h2>
                            <p className="neutering_on">중성화 OK</p>
                        </div>
                        <div className="pet_detail">
                            <p data-swiper-parallax="-300">
                                5개월 ∙ 코숏 치즈 <br />
                                서울 강남구 ∙ 1km 이내
                            </p>
                            <div className="like_wrap" data-swiper-parallax="-200">
                                <button type="button" className="btn-effect">싫어요</button>
                                <button type="button" className="active btn-effect">좋아요</button>
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* Slide 2 */}
                    <SwiperSlide>
                        <div className="img_wrap">
                            <img src="/assets/images/main/main_slide_icon02.svg" data-swiper-parallax="-500" className="icon_img" alt="" />
                            
                            <div className="main_slide_inside">
                                <div className="swiper-wrapper">
                                    <div className="swiper-slide"><img src="/assets/images/main/main_slide_img02.png" className="pet_img" alt="" /></div>
                                    <div className="swiper-slide"><img src="/assets/images/main/main_slide_img02.png" className="pet_img" alt="" /></div>
                                    <div className="swiper-slide"><img src="/assets/images/main/main_slide_img02.png" className="pet_img" alt="" /></div>
                                </div>
                                <div className="swiper-inside-prev"></div>
                                <div className="swiper-inside-next"></div>
                            </div>

                            <div className="butler_img" data-swiper-parallax="-400">
                                <img src="/assets/images/main/main_slide_butler02.png" alt="집사 이미지" />
                            </div>
                        </div>
                        <div className="txt_wrap" data-swiper-parallax="-200">
                            <h2>냥냥냥 <img src="/assets/images/main/woman_icon.svg" alt="여자 icon" /></h2>
                            <p className="neutering_on">중성화 OK</p>
                        </div>
                        <div className="pet_detail">
                            <p data-swiper-parallax="-300">
                                5개월 ∙ 코숏 치즈 <br />
                                서울 강남구 ∙ 1km 이내
                            </p>
                            <div className="like_wrap" data-swiper-parallax="-200">
                                <button type="button">싫어요</button>
                                <button type="button" className="active">좋아요</button>
                            </div>
                        </div>
                    </SwiperSlide>
                    {/* Slide 3 */}
                    <SwiperSlide>
                        <div className="img_wrap">
                            <img src="/assets/images/main/main_slide_icon03.svg" data-swiper-parallax="-500" className="icon_img" alt="" />
                            
                            <Swiper 
                                nested={true}
                                modules={[Navigation]}
                                className="main_slide_inside"
                                navigation={{
                                    prevEl: '.swiper-inside-prev',
                                    nextEl: '.swiper-inside-next',
                                }}
                            >
                                <SwiperSlide><img src="/assets/images/main/main_slide_img03.png" className="pet_img" alt="" /></SwiperSlide>
                                <SwiperSlide><img src="/assets/images/main/main_slide_img03.png" className="pet_img" alt="" /></SwiperSlide>
                                <SwiperSlide><img src="/assets/images/main/main_slide_img03.png" className="pet_img" alt="" /></SwiperSlide>
                                <div className="swiper-inside-prev"></div>
                                <div className="swiper-inside-next"></div>
                            </Swiper>

                            <div className="butler_img" data-swiper-parallax="-400">
                                <img src="/assets/images/main/main_slide_butler03.png" alt="집사 이미지" />
                            </div>
                        </div>
                        <div className="txt_wrap" data-swiper-parallax="-200">
                            <h2>멍텅구리 <img src="/assets/images/main/man_icon.svg" alt="남자 icon" /></h2>
                            <p className="neutering_on">중성화 OK</p>
                        </div>
                        <div className="pet_detail">
                            <p data-swiper-parallax="-300">
                                5개월 ∙ 코숏 치즈 <br />
                                서울 강남구 ∙ 1km 이내
                            </p>
                            <div className="like_wrap" data-swiper-parallax="-200">
                                <button type="button">싫어요</button>
                                <button type="button" className="active">좋아요</button>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>

            <section className="ai_profile_banner">
                <a href="">
                    <img src="/assets/images/main/ai_banner_img.png" alt="블러 처리된 사진" />
                    <div className="txt_wrap">
                        <h2>아직 AI 프로필이 없으시네요?</h2>
                        <p>멍텅구리의 다양한 모습을 지금 만나 보세요!</p>
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
                        🐶 <span>멍텅구리</span>와 <br />
                        📍️ <span>안돌이지돌이다래미한숨바우</span>에서 <br />
                        📏 <span>3km</span> 산책하셨네요.
                    </p>
                </div>
            </section>
        </div>
    );
}
