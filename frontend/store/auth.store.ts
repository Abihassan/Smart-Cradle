import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  loading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isHydrated: false,
  loading: false,
  error: null,

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, isLoggedIn: false, error: null }),
}));
