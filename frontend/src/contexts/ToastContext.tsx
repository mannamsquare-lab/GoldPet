import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast_container">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`toast_message ${toast.type}`} 
                        onClick={() => removeToast(toast.id)}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>{`
                .toast_container {
                    position: fixed;
                    bottom: 50px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                    width: 100%;
                    align-items: center;
                    padding: 0 20px;
                }
                .toast_message {
                    background: rgba(30, 30, 30, 0.85); /* Default dark background for all */
                    color: white;
                    padding: 14px 20px;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 500;
                    pointer-events: auto;
                    animation: fadeIn 0.3s forwards, fadeOut 0.3s 2.7s forwards;
                    width: 100%;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    line-height: 1.4;
                    word-break: keep-all;
                }
                /* Removed specific background colors for success/error to keep uniform dark style */
                .toast_message.error { }
                .toast_message.success { }
                
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                @keyframes fadeOut { 
                    from { opacity: 1; transform: translateY(0); } 
                    to { opacity: 0; transform: translateY(10px); } 
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
