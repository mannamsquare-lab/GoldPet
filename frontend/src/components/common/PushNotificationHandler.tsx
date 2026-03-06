import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nativeBridge } from '../../bridge/nativeBridge';

export function PushNotificationHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = nativeBridge.onEvent('pushNotificationClicked', (eventData) => {
            const raw = eventData as Record<string, unknown> | undefined;
            const data = (raw?.data as Record<string, unknown>) || raw;
            if (!data) return;

            const { targetType, targetId, type } = data;
            switch (targetType) {
                case 'CHAT_ROOM': navigate(`/chat/${targetId}`); break;
                case 'POST': navigate(`/community/${targetId}`); break;
                case 'MATCH': navigate('/friend-list'); break;
                case 'WALK': navigate(`/walk/detail/${targetId}`); break;
                default:
                    if (type === 'LIKE' || type === 'MATCH') {
                        navigate('/friend-list');
                    } else if (type === 'MESSAGE') {
                        navigate(`/chat/${targetId}`);
                    } else {
                        navigate('/notifications');
                    }
            }
        });
        return unsubscribe;
    }, [navigate]);

    return null;
}
