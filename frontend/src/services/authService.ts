// Auth Service - API integration for Authentication

import apiClient from "./api/client";
import { nativeBridge } from "../bridge/nativeBridge";
import { useAuthStore } from "../stores/authStore";

export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  mainLocationText?: string;
}

export interface SnsSignupRequest {
  provider: string;
  nickname: string;
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LinkSuggestionInfo {
  maskedEmail: string;
  existingProvider: string;
  tempToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    nickname: string;
    email?: string;
  };
  linkSuggestion?: LinkSuggestionInfo;
}

// Mock responses
const mockAuthResponse = (data: {
  username?: string;
  nickname?: string;
}): AuthResponse => ({
  accessToken: "mock-access-token-" + Date.now(),
  refreshToken: "mock-refresh-token-" + Date.now(),
  user: {
    id: 1,
    username: data.username || "user",
    nickname: data.nickname || "지오",
    email: "user@goldpet.com",
  },
});

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      return mockAuthResponse({
        username: data.username,
        nickname: data.nickname,
      });
    }

    try {
      const response = await apiClient.post("/auth/signup", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "회원가입에 실패했습니다."
      );
    }
  },

  snsSignup: async (data: SnsSignupRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      return mockAuthResponse({ nickname: data.nickname });
    }

    try {
      const response = await apiClient.post("/auth/sns-signup", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "SNS 회원가입에 실패했습니다."
      );
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      if (data.username === "fail") {
        throw new Error("아이디 또는 비밀번호가 잘못되었습니다.");
      }
      return mockAuthResponse({ username: data.username });
    }

    try {
      const response = await apiClient.post("/auth/login", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "로그인에 실패했습니다."
      );
    }
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { available: username !== "duplicate" && username !== "admin" };
    }

    try {
      const response = await apiClient.get(
        `/auth/check-username?username=${username}`
      );
      return response.data;
    } catch {
      return { available: false };
    }
  },

  checkNickname: async (nickname: string): Promise<{ available: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { available: nickname !== "duplicate" && nickname !== "관리자" };
    }

    try {
      const response = await apiClient.get(
        `/auth/check-nickname?nickname=${nickname}`
      );
      return response.data;
    } catch {
      return { available: false };
    }
  },

  openLoginPopup: (provider: string, email?: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      // If email is provided, forcibly use test login (Dev Login)
      if (email) {
          apiClient
            .post("/auth/dev-login", { email })
            .then((response) => {
              resolve(response.data);
            })
            .catch((err) => {
              console.error("Dev login failed", err);
              reject(err);
            });
          return;
      }

      if (USE_MOCK) {
        // Add a small delay to simulate network
        setTimeout(() => {
          // Call Backend Dev Login to get REAL valid token
          apiClient
            .post("/auth/dev-login", { email }) // email might be undefined here, but handled above if intended
            .then((response) => {
              resolve(response.data);
            })
            .catch((err) => {
              console.error("Dev login failed", err);
              // alert remove - caller should handle error
              reject(err);
            });
        }, 500);
        return;
      }

      // Native app: use Flutter bridge for social login
      if (nativeBridge.isAvailable()) {
        nativeBridge
          .callMethod("login", { provider })
          .then((result: any) => {
            if (result.accessToken) {
              resolve(result);
            } else if (result.success === false) {
              reject(new Error(result.message || "로그인에 실패했습니다."));
            } else {
              resolve(result);
            }
          })
          .catch((err: Error) => {
            reject(new Error(err.message || "로그인에 실패했습니다."));
          });
        return;
      }

      // Web browser: OAuth2 popup flow
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
        }/oauth2/authorization/${provider}`,
        "Login",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === "LOGIN_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          resolve(event.data);
          popup?.close();
        } else if (event.data.type === "LOGIN_ERROR") {
          window.removeEventListener("message", handleMessage);
          reject(new Error(event.data.message || "로그인에 실패했습니다."));
          popup?.close();
        }
      };

      window.addEventListener("message", handleMessage);

      // Check if popup is closed without completing login
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          reject(new Error("로그인이 취소되었습니다."));
        }
      }, 500);
    });
  },

  confirmLink: async (tempToken: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/confirm-link", { tempToken });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "계정 연동에 실패했습니다."
      );
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    try {
      const response = await apiClient.post("/auth/refresh", { refreshToken });
      return response.data;
    } catch {
      useAuthStore.getState().logout();
      throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  },
};
