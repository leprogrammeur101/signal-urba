import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { reportsApi } from '../../api/reports';
import type { Report } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  NEW:         '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  RESOLVED:    '#10b981',
};

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getAll()
      .then((res) => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude:        5.3600,
          longitude:       -4.0083,
          latitudeDelta:   0.05,
          longitudeDelta:  0.05,
        }}
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            pinColor={STATUS_COLORS[report.status] ?? '#6b7280'}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{report.category.name}</Text>
                {report.title && <Text style={styles.calloutText}>{report.title}</Text>}
                <Text style={[styles.calloutStatus, { color: STATUS_COLORS[report.status] }]}>
                  {report.status === 'NEW' ? 'Nouveau' : report.status === 'IN_PROGRESS' ? 'En cours' : 'Résolu'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{reports.length} signalement(s)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  map:           { flex: 1 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badge:         { position: 'absolute', top: 12, right: 12, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  badgeText:     { fontSize: 13, fontWeight: '600', color: '#374151' },
  callout:       { padding: 8, minWidth: 140 },
  calloutTitle:  { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  calloutText:   { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  calloutStatus: { fontSize: 12, fontWeight: '600' },
});
