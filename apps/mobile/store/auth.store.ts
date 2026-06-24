import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  isLoading:    boolean;
  setAuth:      (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout:       () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:        null,
  accessToken: null,
  isLoading:   true,

  setAuth: async (user, accessToken, refreshToken) => {
    await AsyncStorage.setItem('accessToken',  accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user',         JSON.stringify(user));
    set({ user, accessToken });
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    set({ user: null, accessToken: null });
  },

  loadFromStorage: async () => {
    try {
      const token   = await AsyncStorage.getItem('accessToken');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        set({ accessToken: token, user: JSON.parse(userStr) });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
