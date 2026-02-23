import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../services/api/client';

export const LoginSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Fetch user info using the token directly in the Authorization header
            apiClient.get('/users/me', { headers: { Authorization: `Bearer ${token}` } })
                .then((response) => {
                    const user = response.data;

                    // Check if running in popup
                    if (window.opener) {
                        if (!user.nickname) {
                            // Incomplete -> Send SIGNUP_REQUIRED message
                            window.opener.postMessage({
                                type: 'LOGIN_ERROR',
                                message: 'SIGNUP_REQUIRED',
                                signupRequired: true,
                                provider: user.oauthProvider
                            }, '*');
                        } else {
                            // Complete -> Send LOGIN_SUCCESS message
                            window.opener.postMessage({
                                type: 'LOGIN_SUCCESS',
                                accessToken: token,
                                refreshToken: '',
                                user
                            }, '*');
                        }
                        // Close popup is handled by opener or self? 
                        // Usually self closes after sending message, but let's wait a tick
                        // setTimeout(() => window.close(), 100);
                        // Actually, let's let the opener close it or close it here.
                        // Ideally, we close it here.
                        // But let's keep the logic simple.
                        // window.close(); 
                        // The authService handler closes it. But if we close it here, the handler might miss it?
                        // No, postMessage is synchronous-ish.
                        // But let's leave it open for a split second or let the opener close it?
                        // The authService code: popup.close() is called.
                        // So we just need to send the message.
                    } else {
                        // Fallback for non-popup (e.g. mobile redirect if popup failed)
                        if (!user.nickname) {
                            navigate('/signup', { state: { isSns: true, provider: user.oauthProvider } });
                        } else {
                            login(token, '', user);
                            navigate('/home', { replace: true });
                        }
                    }
                })
                .catch((error) => {
                    console.error('Failed to fetch user info', error);
                    if (!window.opener) {
                        navigate('/login', { replace: true });
                    } else {
                        window.close();
                    }
                });
        } else {
            if (!window.opener) {
                navigate('/login', { replace: true });
            } else {
                window.close();
            }
        }
    }, [searchParams, navigate, login]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>로그인 중입니다...</p>
        </div>
    );
};
