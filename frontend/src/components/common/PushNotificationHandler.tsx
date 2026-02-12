import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nativeBridge } from '../../bridge/nativeBridge';

export function PushNotificationHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = nativeBridge.onEvent('pushNotificationClicked', (eventData) => {
            const data = eventData?.data || eventData;
            if (!data) return;

            const { targetType, targetId } = data;
            switch (targetType) {
                case 'CHAT_ROOM': navigate(`/chat/${targetId}`); break;
                case 'POST': navigate(`/community/${targetId}`); break;
                case 'MATCH': navigate('/friend-list'); break;
                case 'WALK': navigate(`/walk/detail/${targetId}`); break;
                default: navigate('/notifications');
            }
        });
        return unsubscribe;
    }, [navigate]);

    return null;
}
