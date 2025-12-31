import React from 'react';
import ReactDOM from 'react-dom';

interface AlertModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const AlertModal = ({ 
    isOpen, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = '확인', 
    cancelText = '취소' 
}: AlertModalProps) => {
    if (!isOpen) return null;

    // Portal to mount directly to body or a specific root, ensuring z-index handling
    // However, given the CSS structure of .alert_modal (fixed position usually), direct rendering might work if z-index is high enough.
    // React Portals are safer for modals.
    
    const content = (
        <div className="alert_modal" style={{ display: 'flex' }}>
            <div className="alert_wrap">
                <div className="txt_wrap">
                    <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
                </div>
                <div className="btn_wrap">
                    {onCancel ? (
                        /* 2 Buttons Case (Confirm) */
                        <>
                            <button type="button" className="brown2" onClick={onCancel}>{cancelText}</button>
                            <button type="button" className="brown1" onClick={onConfirm}>{confirmText}</button>
                        </>
                    ) : (
                        /* 1 Button Case (Alert) */
                        <button 
                            type="button" 
                            className="brown1" 
                            onClick={onConfirm} 
                            style={{ width: '100%' }}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};
