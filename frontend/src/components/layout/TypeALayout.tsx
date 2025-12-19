import { Outlet } from 'react-router-dom';
import { MainHeader } from '../common/MainHeader';

interface TypeALayoutProps {
    variant: 'logo-only' | 'back-only';
}

export const TypeALayout = ({ variant }: TypeALayoutProps) => {
    return (
        <div style={{ backgroundColor: '#FFF7E6', minHeight: '100vh', paddingBottom: 0, position: 'relative' }}>
            <MainHeader variant={variant} className="intro_header" />
            <div id="mainContainer">
                <Outlet />
            </div>
        </div>
    );
};
