

interface FriendCardProps {
    index: number;
}

export const FriendCard = ({ index }: FriendCardProps) => {
    return (
        <div className="list_wrap">
            <div className="img_wrap">
                {/* Icon Top Left */}
                <img src="/assets/images/main/main_slide_icon01.svg" className="icon_img" alt="" />
                
                {/* Pet Image Swiper */}
                <div className="pet_img_wrap">
                    <img src="/assets/images/main/main_slide_img01.png" className="pet_img" alt="" />
                    <div className={`swiper-pet-prev swiper-pet-prev-${index} btn-effect`}></div>
                    <div className={`swiper-pet-next swiper-pet-next-${index} btn-effect`}></div>
                </div>

                {/* Butler Image Bottom Right */}
                <div className="butler_img">
                    <img src="/assets/images/main/main_slide_butler01.jpg" alt="집사 이미지" />
                </div>
            </div>

            <div className="txt_wrap">
                <h2>멍텅구리 <img src="/assets/images/main/woman_icon.svg" alt="여자 icon" /></h2>
                <p>중성화 OK</p>
            </div>

            <div className="pet_detail">
                <p>
                    5개월 ∙ 코숏 치즈 <br />
                    서울 강남구 ∙ 1km 이내
                </p>
                <br />
                <p>엄청 활발하고 산책에 적극적인 아이랍니다! : )</p>
                <div className="wish_dot">
                    <p className="label1">중성화 완료</p>
                    <p className="label2">매우 활발함</p>
                    <p className="label3">견과류 주의 필요</p>
                    <p className="label4">산책 매우 좋아함</p>
                </div>
                
                {/* Like/Dislike Buttons */}
                <div className="like_wrap">
                    {index === 2 ? (
                        <button type="button" className="now_chat btn-effect">지금 채팅하기</button>
                    ) : (
                        <>
                            <button type="button" className="dislike_btn btn-effect"><img src="/assets/images/common/dislike_btn.svg" alt="" />싫어요</button>
                            <button type="button" className="like_btn btn-effect"><img src="/assets/images/common/like_btn.svg" alt="" />좋아요</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
