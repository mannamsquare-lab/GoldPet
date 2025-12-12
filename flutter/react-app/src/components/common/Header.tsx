import './Header.css';

interface HeaderProps {
    onBack?: () => void;
    title?: string;
}

export const Header = ({ onBack, title }: HeaderProps) => {
    return (
        <header className="app-header">
            {onBack && (
                <button type="button" className="header-back-button" onClick={onBack}>
                    <img src="/assets/images/common/icon_back.svg" alt="Back" />
                </button>
            )}
            {title && <h1 className="header-title">{title}</h1>}
        </header>
    );
};
