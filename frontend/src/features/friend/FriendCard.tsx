
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import type { Friend } from '../../services/friendService';
import { friendService, formatPetTag } from '../../services/friendService';
import { chatService } from '../../services/chatService';
import { ProfileImageSlider } from '../../components/common/ProfileImageSlider';
import { useAlert } from '../../contexts/AlertContext';

interface FriendCardProps {
    data: Friend;
    onLikeStateChange?: () => void;
    viewMode?: 'default' | 'sent_like' | 'received_like' | 'mutual';
}

export const FriendCard = ({ data, onLikeStateChange, viewMode = 'default' }: FriendCardProps) => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isMutual, setIsMutual] = useState(false);

    const handleStartChat = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const room = await chatService.getOrCreateDirectRoom(data.id);
            navigate(`/chat/${room.id}`);
        } catch (error: any) {
            showAlert(error.message || '채팅방을 열 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDistance = (dist: number) => {
        if (dist >= 1000) return `${(dist / 1000).toFixed(1)}km`;
        return `${dist}m`;
    };

    const handleLike = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const result = await friendService.likeUser(data.id);
            setIsLiked(true);
            setIsMutual(result.isMutual);
            
            if (result.isMutual) {
                showAlert(`${data.petName}과 서로 좋아해가 되었어요! 💕`);
            } else {
                showAlert(`${data.petName}에게 좋아요를 보냈어요! ❤️`);
            }
            
            onLikeStateChange?.();
        } catch {
            showAlert('좋아요를 보내는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDislike = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            if (viewMode === 'received_like') {
                await friendService.rejectLike(data.id);
                showAlert(`${data.petName}님의 좋아요를 거절했어요 😢`);
            } else {
                await friendService.unlikeUser(data.id);
                
                if (viewMode === 'sent_like') {
                    showAlert(`${data.petName}님에게 보낸 좋아요를 취소했어요 ↩️`);
                } else if (viewMode === 'mutual' || isMutual) {
                    showAlert(`${data.petName}님과의 매칭을 해제했어요 👋`);
                } else {
                    showAlert(`${data.petName}님을 패스했어요 🙅`);
                }
            }
            setIsLiked(false);
            setIsMutual(false);
            onLikeStateChange?.();
        } catch {
            showAlert('작업에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="list_wrap">
            <ProfileImageSlider
                className="img_wrap"
                swiperWrapperClass="pet_img_wrap"
                images={data.images}
                secondaryImage={data.profileImageUrl || "/assets/images/main/main_slide_butler01.jpg"}
                secondaryImageClass="butler_img"
                swiperProps={{
                    modules: [Navigation],
                    navigation: {
                        prevEl: `.swiper-pet-prev-${data.id}`,
                        nextEl: `.swiper-pet-next-${data.id}`,
                    }
                }}
                innerChildren={
                    <>
                        <div className={`swiper-pet-prev swiper-pet-prev-${data.id}`}></div>
                        <div className={`swiper-pet-next swiper-pet-next-${data.id}`}></div>
                    </>
                }
            >
                {/* Icon Top Left */}
                <img src="/assets/images/main/main_slide_icon01.svg" className="icon_img" alt="" />
            </ProfileImageSlider>

            <div className="txt_wrap">
                <h2>{data.petName} <img src={data.petGender === 'FEMALE' ? "/assets/images/main/woman_icon.svg" : "/assets/images/main/man_icon.svg"} alt="성별 icon" /></h2>
                {data.isNeutered && <p>중성화 OK</p>}
            </div>

            <div className="pet_detail">
                <p>
                    {data.petAge}살 ∙ {data.petBreed} <br />
                    {data.locationText || '위치 미설정'} ∙ {formatDistance(data.distance)} 이내
                </p>
                <br />
                <p>{data.description}</p>
                <div className="wish_dot">
                    {data.tags
                        .map(tag => formatPetTag(tag))
                        .filter(tag => tag !== '')
                        .map((tag, i) => (
                            <p key={i} className={`label${(i % 4) + 1}`}>{tag}</p>
                        ))
                    }
                </div>
                
                {/* Like/Dislike buttons */}
                <div className="like_wrap">
                    {viewMode === 'sent_like' ? (
                        <button type="button" className="dislike_btn" onClick={handleDislike} disabled={isLoading} style={{ width: '100%' }}>
                            <img src="/assets/images/common/dislike_btn.svg" alt="" />취소하기
                        </button>
                    ) : viewMode === 'mutual' || isMutual ? (
                        <>
                            <button type="button" className="dislike_btn" onClick={handleDislike} disabled={isLoading}>
                                <img src="/assets/images/common/dislike_btn.svg" alt="" />싫어요
                            </button>
                            <button type="button" className="like_btn active" onClick={handleStartChat} disabled={isLoading}>
                                <img src="/assets/images/common/chat_icon.svg" alt="" style={{ marginRight: '6px' }} />채팅하기
                            </button>
                        </>
                    ) : isLiked ? (
                        <>
                            <button type="button" className="dislike_btn" onClick={handleDislike} disabled={isLoading}>
                                <img src="/assets/images/common/dislike_btn.svg" alt="" />취소
                            </button>
                            <button type="button" className="like_btn active" disabled>
                                <img src="/assets/images/common/like_btn.svg" alt="" />좋아요 완료
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" className="dislike_btn" onClick={handleDislike} disabled={isLoading}>
                                <img src="/assets/images/common/dislike_btn.svg" alt="" />싫어요
                            </button>
                            <button type="button" className="like_btn" onClick={handleLike} disabled={isLoading}>
                                <img src="/assets/images/common/like_btn.svg" alt="" />좋아요
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
