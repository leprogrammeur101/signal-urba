import api from './client';
import type { Report, ReportStatus } from '../types';

export interface ReportsResponse {
  data:  Report[];
  total: number;
  page:  number;
  limit: number;
}

export interface FilterParams {
  status?:     ReportStatus;
  categoryId?: string;
  page?:       number;
  limit?:      number;
}

export const reportsApi = {
  getAll: (params?: FilterParams) =>
    api.get<ReportsResponse>('/reports', { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Report>(`/reports/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: ReportStatus, comment?: string) =>
    api.patch<Report>(`/reports/${id}/status`, { status, comment }).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/reports/${id}`).then((r) => r.data),
};
