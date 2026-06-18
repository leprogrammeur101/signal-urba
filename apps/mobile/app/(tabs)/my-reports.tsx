import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { reportsApi } from '../../api/reports';
import { useAuthStore } from '../../store/auth.store';
import type { Report, ReportStatus } from '../../types';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  NEW:         { label: 'Nouveau',  color: '#1d4ed8', bg: '#dbeafe' },
  IN_PROGRESS: { label: 'En cours', color: '#92400e', bg: '#fef3c7' },
  RESOLVED:    { label: 'Résolu',   color: '#065f46', bg: '#d1fae5' },
};

export default function MyReportsScreen() {
  const { accessToken, logout } = useAuthStore();
  const [reports,     setReports]     = useState<Report[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const fetchReports = async () => {
    if (!accessToken) return;
    try {
      const data = await reportsApi.getMine();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recharge à chaque fois que l'écran est affiché
  useFocusEffect(useCallback(() => { fetchReports(); }, [accessToken]));

  if (!accessToken) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Connecte-toi pour voir tes signalements</Text>
      </View>
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchReports(); }}
            colors={['#2563eb']}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Aucun signalement pour l'instant</Text>
          </View>
        }
        contentContainerStyle={reports.length === 0 ? { flex: 1 } : { padding: 16 }}
        renderItem={({ item }) => {
          const s = STATUS_CONFIG[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.category}>{item.category.name}</Text>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
              {item.title && <Text style={styles.cardTitle}>{item.title}</Text>}
              {item.address && <Text style={styles.cardAddress}>📍 {item.address}</Text>}
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </Text>
            </View>
          );
        }}
      />

      {/* Bouton déconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f3f4f6' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText:   { fontSize: 15, color: '#9ca3af', textAlign: 'center' },
  card:        { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  category:    { fontWeight: '700', fontSize: 15, color: '#111827' },
  badge:       { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText:   { fontSize: 12, fontWeight: '600' },
  cardTitle:   { fontSize: 14, color: '#374151', marginBottom: 4 },
  cardAddress: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  cardDate:    { fontSize: 12, color: '#9ca3af' },
  logoutBtn:   { margin: 16, backgroundColor: '#fee2e2', borderRadius: 8, padding: 14, alignItems: 'center' },
  logoutText:  { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
