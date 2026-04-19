// Auth Service - API integration for Authentication

import apiClient from "./api/client";
import { nativeBridge } from "../bridge/nativeBridge";
import { useAuthStore } from "../stores/authStore";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  SnsSignupRequest,
} from "../types/api";

// Re-export for existing importers during migration window.
export type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  SnsSignupRequest,
  LinkSuggestionInfo,
} from "../types/api";

export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    // Preserve axios error shape so UI can read error.response.data.message / status
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  snsSignup: async (data: SnsSignupRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/sns-signup", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "SNS 회원가입에 실패했습니다."
      );
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/login", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "로그인에 실패했습니다."
      );
    }
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    try {
      const response = await apiClient.post("/auth/check-username", {
        username,
      });
      return response.data;
    } catch {
      return { available: false };
    }
  },

  checkEmail: async (email: string): Promise<{ available: boolean; provider?: string }> => {
    try {
      const response = await apiClient.post("/auth/check-email", { email });
      return response.data;
    } catch {
      return { available: false };
    }
  },

  checkNickname: async (nickname: string): Promise<{ available: boolean }> => {
    try {
      const response = await apiClient.post("/auth/check-nickname", {
        nickname,
      });
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

      // Native app: use Flutter bridge for social login
      if (nativeBridge.isAvailable()) {
        nativeBridge
          .callMethod("login", { provider })
          .then((raw) => {
            const result = raw as Record<string, unknown>;
            if (result.type === 'SIGNUP_REQUIRED') {
              const err = Object.assign(new Error('SIGNUP_REQUIRED'), {
                signupRequired: true,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user,
                provider: result.provider,
              });
              reject(err);
            } else if (result.accessToken) {
              resolve(result as unknown as AuthResponse);
            } else if (result.success === false) {
              reject(new Error((result.message as string) || "로그인에 실패했습니다."));
            } else {
              resolve(result as unknown as AuthResponse);
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
        if (event.origin !== window.location.origin) return;
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "계정 연동에 실패했습니다."
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
