import api from './client';
import type { User } from '../types';

export interface AuthResponse {
  user:         User;
  accessToken:  string;
  refreshToken: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  register: (email: string, password: string, firstName?: string, lastName?: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, firstName, lastName }).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api.get<User>('/users/me').then((r) => r.data),
};
