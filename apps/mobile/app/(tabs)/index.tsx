import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LeafletMap, { MapMarker } from '../../components/LeafletMap';
import { reportsApi } from '../../api/reports';
import type { Report } from '../../types';

export default function MapScreen() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    reportsApi.getAll()
      .then((res) => {
        const m: MapMarker[] = res.data.map((r: Report) => ({
          id:        r.id,
          latitude:  r.latitude,
          longitude: r.longitude,
          status:    r.status,
          title:     r.title,
          category:  r.category.name,
        }));
        setMarkers(m);
      })
      .catch(() => setError('Impossible de charger les signalements'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LeafletMap markers={markers} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{markers.length} signalement(s)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#6b7280', fontSize: 14 },
  errorText:   { color: '#ef4444', fontSize: 14, textAlign: 'center', padding: 24 },
  badge:       { position: 'absolute', top: 12, right: 12, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  badgeText:   { fontSize: 13, fontWeight: '600', color: '#374151' },
});
