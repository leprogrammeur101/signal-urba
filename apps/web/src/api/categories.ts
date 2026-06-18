import api from './client';
import type { Category } from '../types';

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),
};
