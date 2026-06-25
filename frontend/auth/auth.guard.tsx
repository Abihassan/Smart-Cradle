import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { setUnauthorizedHandler } from "../api/client";
import { useAuthStore } from "../store/auth.store";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";

/**
 * Renders nothing — performs two side effects:
 *  1. On mount: hydrate auth state from stored tokens (calls /auth/me).
 *  2. On every state/segment change: redirect based on auth + current route group.
 *
 * No per-screen auth checks are needed; this guard owns all redirect logic.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoggedIn, isHydrated, setUser, setHydrated, logout } = useAuthStore();

  // Hydrate once on mount.
  useEffect(() => {
    let mounted = true;

    (async () => {
      const accessToken = await TokenService.getAccessToken();
      if (!accessToken) {
        if (mounted) setHydrated(true);
        return;
      }

      try {
        const me = await AuthService.me();
        if (mounted) setUser(me);
      } catch {
        // me() failed even after the client's own refresh attempt — clear up.
        await TokenService.clear();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Wire the axios client's 401-after-refresh-failure callback to logout.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      router.replace("/(auth)/login");
    });
  }, []);

  // Redirect based on auth state + current segment.
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isHydrated, isLoggedIn, segments]);

  return <>{children}</>;
}
