import axios from 'axios';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'OPERATOR' | 'VIEWER';
  isTwoFactorEnabled: boolean;
}

export interface Setup2faResponse {
  secret: string;
  qrUrl: string;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  token?: string;
  user?: User;
}

const API_URL = 'http://api.goldpet.local/v1/admin/auth';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || '로그인에 실패했습니다.');
      }
      throw new Error('로그인 중 오류가 발생했습니다.');
    }
  },

  async verifyOtp(userId: string | number, code: string): Promise<{ token: string; user: User }> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/verify-2fa`, {
        userId,
        code
      });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('토큰 또는 사용자 정보가 없습니다.');
      }

      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || '인증번호 검증에 실패했습니다.');
      }
      throw new Error('인증 중 오류가 발생했습니다.');
    }
  },

  async setup2fa(): Promise<Setup2faResponse> {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post<Setup2faResponse>(
      `${API_URL}/2fa/setup`, 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async confirm2fa(secret: string, code: string): Promise<void> {
    const token = localStorage.getItem('admin_token');
    // Ensure code is integer format if backend expects int, but backend takes int via JSON.
    // Axios handles number conversion if we pass number, or we can pass int.
    // Backend RequestBody: { secret: String, code: Int }
    await axios.post(
      `${API_URL}/2fa/confirm`,
      { secret, code: parseInt(code, 10) },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  async remove2fa(): Promise<void> {
    const token = localStorage.getItem('admin_token');
    await axios.delete(
      `${API_URL}/2fa`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
};
