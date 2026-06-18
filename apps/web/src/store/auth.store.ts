import { create } from 'zustand';
import type{ User } from '../types/index';

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  setAuth:      (user: User, accessToken: string, refreshToken: string) => void;
  logout:       () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:         null,
  accessToken:  localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
