import { useNavigate } from 'react-router-dom';

interface MainHeaderProps {
    variant: 'logo-only' | 'back-only' | 'logo-with-icons' | 'back-with-menu';
    className?: string;
}

export const MainHeader = ({ variant, className = '' }: MainHeaderProps) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <header id="header" className={className}>
            <div className="header_wrap">
                {/* Variant: Logo Only or Logo With Icons */}
                {(variant === 'logo-only' || variant === 'logo-with-icons') && (
                    <a href="" onClick={(e) => { e.preventDefault(); navigate('/home'); }}>
                        <img src="/assets/images/layout/logo.svg" alt="골든 펫 로고" />
                    </a>
                )}

                {/* Variant: Back Only or Back With Menu */}
                {(variant === 'back-only' || variant === 'back-with-menu') && (
                    <button type="button" className="btn_back" onClick={handleBack}>
                        <img src="/assets/images/layout/header_icon_back.svg" alt="뒤로가기" />
                    </button>
                )}
                
                {/* Right Utility Area */}
                <ul className="header_util">
                    {variant === 'logo-with-icons' && (
                        <>
                            <li><button type="button"><img src="/assets/images/layout/header_icon01.svg" alt="G아이콘" /></button></li>
                            <li><button type="button" onClick={() => navigate('/notifications')}><img src="/assets/images/layout/header_icon02.svg" alt="알림" /></button></li>
                            <li><button type="button" onClick={() => navigate('/profile')}><img src="/assets/images/layout/header_icon03.svg" alt="프로필" /></button></li>
                        </>
                    )}
                    
                    {variant === 'back-with-menu' && (
                        <li><button type="button"><img src="/assets/images/layout/header_icon_menu.svg" alt="메뉴" /></button></li>
                    )}
                </ul>
            </div>
        </header>
    );
};
