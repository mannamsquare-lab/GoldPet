import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

export const OnboardingPage = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

    const handleStart = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        navigate('/permissions');
    };

    const titles = [
        { h2: '펫 메이팅', p: '반려동물을 위한 특별한 만남' },
        { h2: '실시간 채팅', p: '채팅으로 먼저 얘기 나눠보세요' },
        { h2: 'AI 펫 프로필', p: '반려동물이 내 폰으로 쏘옥!' },
        { h2: '산책 기록', p: '반려동물과의 산책을 기록해보세요.' },
    ];

    return (
        <>

            <section id="intro">
                <ul className="tit_wrap">
                    {titles.map((t, i) => (
                        <li key={i} className={i === activeIndex ? 'active' : ''}>
                            <h2>{t.h2}</h2>
                            <p>{t.p}</p>
                        </li>
                    ))}
                </ul>

                <div className="intro_slide">
                    <Swiper
                        modules={[Pagination]}
                        pagination={{ clickable: true, el: '.swiper-pagination' }}
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    >
                        <SwiperSlide>
                            <div className="visual_wrap" style={{ backgroundImage: 'url(/assets/images/intro/intro_img01.png)' }}>
                                <div className="visual_txt">
                                    <h3>골드펫이 추천해드려요.</h3>
                                    <p>
                                        내 주변 반려동물의 친구들을 <br />
                                        추천 받아보세요
                                    </p>
                                </div>
                                <p className="disc">
                                    가까운 거리, 비슷한 종류 & 성향까지 <br />
                                    맞춤추천으로 최고의 만남을 지원해요.
                                </p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="visual_wrap" style={{ backgroundImage: 'url(/assets/images/intro/intro_img02.png)' }}>
                                <div className="visual_txt">
                                    <h3>모든 만남의 시작은 채팅.</h3>
                                    <p>
                                        골드펫은 채팅으로 <br />
                                        먼저 서로를 확인할 수 있어요.
                                    </p>
                                </div>
                                <p className="disc">
                                    먼저 만나기는 부담되기에 우선 채팅으로 <br />
                                    서로에 대해서 알아볼 수 있어요.
                                </p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="visual_wrap" style={{ backgroundImage: 'url(/assets/images/intro/intro_img03.png)' }}>
                                <div className="visual_txt">
                                    <h3>반려동물의 또 다른 모습.</h3>
                                    <p>
                                        반려동물을 내 친구처럼<br />
                                        만들어보세요.
                                    </p>
                                </div>
                                <p className="disc">
                                    반려동물과 함께 놀고 즐기고 대화한다면,<br />
                                    AI로 다양한 상황을 만들어서 즐겨보세요.
                                </p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="visual_wrap" style={{ backgroundImage: 'url(/assets/images/intro/intro_img04.png)' }}>
                                <div className="visual_txt">
                                    <h3>산책 기록과 다양한 정보를 한눈에.</h3>
                                    <p>
                                        나와의 산책 정보와 다양한 정보를 <br />
                                        확인하세요.
                                    </p>
                                </div>
                                <p className="disc">
                                    나는 주로 어떤 코스로 산책을 하는지, 다른 반려동물<br />
                                    들은 어떻게 산책하는지 알아보세요.
                                </p>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                    <div className="swiper-pagination"></div>
                </div>
                <button type="button" className="start_btn" onClick={handleStart} style={{ zIndex: 10 }}>지금 골드펫 시작하기</button>

            </section>
        </>
    );
};

