import './Header.css';

interface HeaderProps {
    onBack?: () => void;
    title?: string;
    rightAction?: React.ReactNode;
}

export const Header = ({ onBack, title, rightAction }: HeaderProps) => {
    return (
        <header className="app-header">
            <div className="header-left">
                {onBack && (
                    <button type="button" className="header-back-button" onClick={onBack}>
                        <img src="/assets/images/layout/header_icon_back.svg" alt="Back" />
                    </button>
                )}
                {title && <h1 className="header-title">{title}</h1>}
            </div>
            {rightAction && (
                <div className="header-right-action">
                    {rightAction}
                </div>
            )}
        </header>
    );
};
