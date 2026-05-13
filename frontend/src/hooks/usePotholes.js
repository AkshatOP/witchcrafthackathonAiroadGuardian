import { useEffect, useRef, useCallback } from 'react';
import { fetchPotholes, fetchStats } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

export const usePotholes = () => {
  const { setPotholes, setStats, setLoadingPotholes, addPothole } = useAppStore();
  const channelRef = useRef(null);

  const load = useCallback(async () => {
    setLoadingPotholes(true);
    try {
      const [pRes, sRes] = await Promise.all([fetchPotholes(), fetchStats()]);
      if (pRes.success) setPotholes(pRes.data?.rows || []);
      if (sRes.success) {
        const d = sRes.data;
        setStats({
          total: d.total || 0,
          severe: d.bySeverity?.severe || 0,
          medium: d.bySeverity?.medium || 0,
          low: d.bySeverity?.low || 0,
        });
      }
    } catch (e) {
      console.warn('Failed to load potholes:', e.message);
    } finally {
      setLoadingPotholes(false);
    }
  }, [setPotholes, setStats, setLoadingPotholes]);

  useEffect(() => {
    load();

    // Supabase Realtime subscription
    channelRef.current = supabase
      .channel('potholes-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'potholes' }, (payload) => {
        addPothole(payload.new);
        // refresh stats
        fetchStats().then((res) => {
          if (res.success) {
            const d = res.data;
            setStats({
              total: d.total || 0,
              severe: d.bySeverity?.severe || 0,
              medium: d.bySeverity?.medium || 0,
              low: d.bySeverity?.low || 0,
            });
          }
        });
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [load, addPothole, setStats]);

  return { reload: load };
};
