import { apiClient } from "../api/client";
import { TokenService } from "./token.service";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export const AuthService = {
  async login(email: string, password: string): Promise<UserResponse> {
    const { data } = await apiClient.post<TokenResponse>("/api/auth/login", {
      email,
      password,
    });
    await TokenService.setTokens(data.access_token, data.refresh_token);
    return AuthService.me();
  },

  async register(name: string, email: string, password: string): Promise<UserResponse> {
    const { data } = await apiClient.post<TokenResponse>("/api/auth/register", {
      name,
      email,
      password,
    });
    await TokenService.setTokens(data.access_token, data.refresh_token);
    return AuthService.me();
  },

  async me(): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>("/api/auth/me");
    return data;
  },

  async refresh(): Promise<TokenResponse> {
    const refreshToken = await TokenService.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const { data } = await apiClient.post<TokenResponse>("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    await TokenService.setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = await TokenService.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post("/api/auth/logout", { refresh_token: refreshToken });
      }
    } finally {
      await TokenService.clear();
    }
  },
};
