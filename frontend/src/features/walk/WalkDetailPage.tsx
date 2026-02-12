
import { useNavigate } from 'react-router-dom';
import { LocationStatus } from '../../components/common/LocationStatus';
import './WalkPage.css';

export const WalkDetailPage = () => {
    const navigate = useNavigate();
    // const { walkId } = useParams();

    return (
        <div id="walkContainer">
            <LocationStatus>
                골드펫과 함께 <br />
                즐거운 산책을 즐겨보세요.
            </LocationStatus>

            <div className="record_wrap">
                <ul className="record_tab">
                    <li>
                        <button type="button" className="active" onClick={() => navigate('/walk')}>
                            우리의 산책 기록
                        </button>
                    </li>
                    <li>
                        <button type="button" onClick={() => navigate('/walk')}>
                            베스트 랭킹
                        </button>
                    </li>
                </ul>

                {/* 상세 */}
                <div className="record_detail">
                    <p>산책거리</p>
                    <div className="detail_tab">
                        <button type="button" className="active">일</button>
                        <button type="button">주</button>
                        <button type="button">월</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalkDetailPage;
