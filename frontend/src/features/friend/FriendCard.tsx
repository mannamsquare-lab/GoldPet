

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
                
                {/* Pet Image Swiper (Simplified to single image for now if array has 1, or just first) */}
                <div className="pet_img_wrap">
                    <img src={data.images[0] || "/assets/images/main/main_slide_img01.png"} className="pet_img" alt="" />
                    {/* Navigation would go here if we implemented full swiper inside card */}
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
                
                {/* Like/Dislike Buttons */}
                <div className="like_wrap">
                    {/* Logic for "Now Chat" vs Like/Dislike - purely visual state for demo */}
                    <button type="button" className="dislike_btn btn-effect"><img src="/assets/images/common/dislike_btn.svg" alt="" />싫어요</button>
                    <button type="button" className="like_btn btn-effect"><img src="/assets/images/common/like_btn.svg" alt="" />좋아요</button>
                </div>
            </div>
        </div>
    );
};
