import { useState, useEffect } from 'react';
import type { reportsApi, FilterParams } from '../api/reports';
import type { Report } from '../types';

export function useReports(filters?: FilterParams) {
  const [reports, setReports] = useState<Report[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getAll(filters);
      setReports(res.data);
      setTotal(res.total);
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [filters?.status, filters?.categoryId, filters?.page]);

  return { reports, total, loading, error, refetch: fetch };
}
