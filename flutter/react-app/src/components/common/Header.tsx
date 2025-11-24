import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
    title?: string;
    onBack?: () => void;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    onBack,
    className = ''
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className={`app-header ${className}`}>
            <button
                type="button"
                className="header-back-button"
                onClick={handleBack}
                aria-label="뒤로가기"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="#614108" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {title && <h1 className="header-title">{title}</h1>}
        </header>
    );
};
