import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div id="bottomNav">
            <ul>
                <li className={location.pathname === '/friend-find' ? 'active' : ''}>
                    <button type="button" className="btn-effect" onClick={() => navigate('/friend-find')}>
                        <img src="/assets/images/layout/b_fix_icon01.svg" alt="" />친구찾기
                    </button>
                </li>
                <li className={location.pathname === '/chat' ? 'active' : ''}>
                    <button type="button" className="btn-effect" onClick={() => navigate('/chat')}>
                        <img src="/assets/images/layout/b_fix_icon02.svg" alt="" />채팅
                    </button>
                </li>
                <li className="ai_btn">
                    <button type="button" className="btn-effect">
                        <img src="/assets/images/layout/b_fix_center_icon.png" alt="AI" />
                    </button>
                </li>
                <li className={location.pathname === '/walk' ? 'active' : ''}>
                    <button type="button" className="btn-effect" onClick={() => navigate('/walk')}>
                        <img src="/assets/images/layout/b_fix_icon03.svg" alt="" />산책
                    </button>
                </li>
                <li>
                    <button type="button" className="btn-effect">
                        <img src="/assets/images/layout/b_fix_icon04.svg" alt="" />커뮤니티
                    </button>
                </li>
            </ul>
        </div>
    );
};
