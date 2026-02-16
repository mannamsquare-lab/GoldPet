import { useNavigate } from 'react-router-dom';
import { Header } from '../common/Header';
import './SubPageLayout.css';

interface SubPageLayoutProps {
    title: string;
    rightAction?: React.ReactNode;
    children: React.ReactNode;
}

export const SubPageLayout = ({ title, rightAction, children }: SubPageLayoutProps) => {
    const navigate = useNavigate();

    return (
        <div className="sub-page-layout">
            <Header
                onBack={() => navigate(-1)}
                title={title}
                rightAction={rightAction}
            />
            <div className="sub-page-content">
                {children}
            </div>
        </div>
    );
};
