import api from './client';
import type { Report } from '../types';

export const reportsApi = {
  getAll: (params?: { status?: string; categoryId?: string }) =>
    api.get<{ data: Report[]; total: number }>('/reports', { params }).then((r) => r.data),

  getMine: () =>
    api.get<Report[]>('/reports/me').then((r) => r.data),

  getOne: (id: string) =>
    api.get<Report>(`/reports/${id}`).then((r) => r.data),

  create: (data: {
    categoryId:   string;
    latitude:     number;
    longitude:    number;
    title?:       string;
    description?: string;
    address?:     string;
    photoUrl?:    string;
  }) => api.post<Report>('/reports', data).then((r) => r.data),
};
