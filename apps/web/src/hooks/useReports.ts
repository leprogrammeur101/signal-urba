import { useState, useEffect, useRef } from 'react';
import { reportsApi } from '../api/reports';
import type { FilterParams } from '../api/reports';
import type { Report } from '../types';

export function useReports(filters?: FilterParams) {
  const [reports, setReports] = useState<Report[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const mountedRef = useRef(true);

  const fetch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportsApi.getAll(filters);
      if (mountedRef.current) {
        setReports(res.data);
        setTotal(res.total);
      }
    } catch (e) {
      console.error('useReports error:', e);
      if (mountedRef.current) setError('Erreur lors du chargement');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [filters?.status, filters?.categoryId, filters?.page]);

  return { reports, total, loading, error, refetch: fetch };
}