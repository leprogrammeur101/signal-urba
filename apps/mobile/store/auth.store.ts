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
    await AsyncStorage.multiSet([
      ['accessToken',  accessToken],
      ['refreshToken', refreshToken],
      ['user',         JSON.stringify(user)],
    ]);
    set({ user, accessToken });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    set({ user: null, accessToken: null });
  },

  loadFromStorage: async () => {
    try {
      const [[, token], [, userStr]] = await AsyncStorage.multiGet(['accessToken', 'user']);
      if (token && userStr) {
        set({ accessToken: token, user: JSON.parse(userStr) });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
