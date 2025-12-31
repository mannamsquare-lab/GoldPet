
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Friend } from '../../services/friendService';

interface FriendCardProps {
    data: Friend;
}

export const FriendCard = ({ data }: FriendCardProps) => {
    const formatDistance = (dist: number) => {
        if (dist >= 1000) return `${(dist / 1000).toFixed(1)}km`;
        return `${dist}m`;
    };

    return (
        <div className="list_wrap">
            <div className="img_wrap">
                {/* Icon Top Left based on some logic or random */}
                <img src="/assets/images/main/main_slide_icon01.svg" className="icon_img" alt="" />
                
                {/* 메인 반려동물 이미지 */}
                <div className="pet_img_wrap">
                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            prevEl: `.swiper-pet-prev-${data.id}`,
                            nextEl: `.swiper-pet-next-${data.id}`,
                        }}
                        className="swiper-wrapper"
                    >
                        {data.images.length > 0 ? data.images.map((img, i) => (
                             <SwiperSlide key={i}><img src={img} className="pet_img" alt="" /></SwiperSlide>
                        )) : (
                            // Fallback
                            <SwiperSlide><img src="/assets/images/main/main_slide_img01.png" className="pet_img" alt="" /></SwiperSlide>
                        )}
                    </Swiper>
                    <div className={`swiper-pet-prev swiper-pet-prev-${data.id}`}></div>
                    <div className={`swiper-pet-next swiper-pet-next-${data.id}`}></div>
                </div>

                {/* Butler Image Bottom Right */}
                <div className="butler_img">
                    <img src={data.profileImageUrl || "/assets/images/main/main_slide_butler01.jpg"} alt="집사 이미지" />
                </div>
            </div>

            <div className="txt_wrap">
                <h2>{data.petName} <img src={data.petGender === 'FEMALE' ? "/assets/images/main/woman_icon.svg" : "/assets/images/main/man_icon.svg"} alt="성별 icon" /></h2>
                {data.isNeutered && <p>중성화 OK</p>}
            </div>

            <div className="pet_detail">
                <p>
                    {data.petAge}살 ∙ {data.petBreed} <br />
                    서울 강남구 ∙ {formatDistance(data.distance)} 이내
                </p>
                <br />
                <p>{data.description}</p>
                <div className="wish_dot">
                    {data.tags.map((tag, i) => (
                        <p key={i} className={`label${(i % 4) + 1}`}>{tag}</p>
                    ))}
                </div>
                
                {/* class 없으면 default, active 추가 하면 좋아요 */}
                <div className="like_wrap">
                    <button type="button" className="dislike_btn"><img src="/assets/images/common/dislike_btn.svg" alt="" />싫어요</button>
                    <button type="button" className="like_btn"><img src="/assets/images/common/like_btn.svg" alt="" />좋아요</button>
                </div>
            </div>
        </div>
    );
};
