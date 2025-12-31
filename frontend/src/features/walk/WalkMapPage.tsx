
import { useNavigate } from 'react-router-dom';
import './WalkPage.css';

export const WalkMapPage = () => {
    const navigate = useNavigate();

    return (
        <div id="walkContainer">
            <div className="talk_wrap">
                <p>
                    골드펫과 함께 <br />
                    즐거운 산책을 즐겨보세요.
                </p>
                <button type="button">
                    <img src="/assets/images/common/pin_icon.svg" alt="지도 마커" />
                    서울 강남구
                </button>
            </div>
            
            <div className="walk_wrap">
                {/* 지도 */}
                <div className="map_box">
                    {/* Map Implementation Placeholder */}
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                        지도 API 연동 예정
                    </div>
                </div>
                
                <div className="txt_wrap">
                    <dl>
                        <dt>거리(km)</dt>
                        <dd>1.0</dd>
                    </dl>
                    <dl>
                        <dt>시간(분)</dt>
                        <dd>1,680</dd>
                    </dl>
                    <dl>
                        <dt>칼로리(Kcal)</dt>
                        <dd>3,200</dd>
                    </dl>
                    <dl>
                        <dt>적립(Gold)</dt>
                        <dd>7,700</dd>
                    </dl>
                </div>
                
                <div className="link_wrap">
                    <button type="button">
                        <img src="/assets/images/walk/camera_icon.svg" alt="" />
                        사진 촬영하기
                    </button>
                    <button type="button" onClick={() => navigate('/walk')}>
                        <img src="/assets/images/walk/play_icon.svg" alt="" />
                        산책 시작하기
                    </button>
                </div>
                
                <div className="open_check">
                    <input type="checkbox" id="open" />
                    <label htmlFor="open">다른 사용자들에게 공개할 지 선택해주세요.</label>
                </div>
            </div>
        </div>
    );
};

export default WalkMapPage;
