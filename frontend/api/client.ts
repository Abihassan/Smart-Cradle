import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { TokenService } from "../auth/token.service";
import { API_BASE_URL } from "../utils/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await TokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function retryWithToken(config: InternalAxiosRequestConfig, token: string | null) {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return apiClient(config);
}

// onUnauthorized is set by auth.guard.tsx so this client doesn't need to
// import navigation directly (keeps this file dependency-free / testable).
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      throw error;
    }

    // Don't try to refresh on the refresh/login endpoints themselves.
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      throw error;
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (token) {
            resolve(retryWithToken(originalRequest, token));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await TokenService.getRefreshToken();
      if (!refreshToken) throw error;

      const { data } = await apiClient.post("/api/auth/refresh", {
        refresh_token: refreshToken,
      });

      await TokenService.setTokens(data.access_token, data.refresh_token);

      queue.forEach((cb) => cb(data.access_token));
      queue = [];
      isRefreshing = false;

      return retryWithToken(originalRequest, data.access_token);
    } catch (refreshError) {
      queue.forEach((cb) => cb(null));
      queue = [];
      isRefreshing = false;

      await TokenService.clear();
      onUnauthorized?.();

      throw refreshError;
    }
  }
);
