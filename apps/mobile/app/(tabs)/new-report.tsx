import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { reportsApi } from '../../api/reports';
import { categoriesApi } from '../../api/categories';
import { useAuthStore } from '../../store/auth.store';
import type { Category } from '../../types';

export default function NewReportScreen() {
  const { accessToken } = useAuthStore();
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [categoryId,   setCategoryId]   = useState('');
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [location,     setLocation]     = useState<{ lat: number; lon: number } | null>(null);
  const [address,      setAddress]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [locLoading,   setLocLoading]   = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const getLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorise la géolocalisation pour continuer');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });

      // Reverse geocoding
      const [place] = await Location.reverseGeocodeAsync({
        latitude:  loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place) {
        setAddress([place.street, place.city].filter(Boolean).join(', '));
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de récupérer ta position');
    } finally {
      setLocLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      Alert.alert('Non connecté', 'Connecte-toi pour signaler');
      router.push('/(auth)/login');
      return;
    }
    if (!categoryId) { Alert.alert('Erreur', 'Choisis une catégorie'); return; }
    if (!location)   { Alert.alert('Erreur', 'Récupère ta position d\'abord'); return; }

    setLoading(true);
    try {
      await reportsApi.create({
        categoryId,
        latitude:    location.lat,
        longitude:   location.lon,
        title:       title   || undefined,
        description: description || undefined,
        address:     address || undefined,
      });
      Alert.alert('✅ Signalement envoyé !', 'Merci pour ta contribution.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/my-reports') },
      ]);
      // Reset
      setCategoryId(''); setTitle(''); setDescription('');
      setLocation(null); setAddress('');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nouveau signalement</Text>

      {/* Catégorie */}
      <Text style={styles.label}>Catégorie *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catBtn, categoryId === cat.id && styles.catBtnActive]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text style={[styles.catText, categoryId === cat.id && styles.catTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Titre */}
      <Text style={styles.label}>Titre (optionnel)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Nid de poule devant le marché"
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text style={styles.label}>Description (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Décris le problème..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      {/* Géolocalisation */}
      <Text style={styles.label}>Localisation *</Text>
      <TouchableOpacity style={styles.locBtn} onPress={getLocation} disabled={locLoading}>
        {locLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.locBtnText}>
              {location ? '📍 Position récupérée' : '📍 Récupérer ma position'}
            </Text>
        }
      </TouchableOpacity>

      {address ? (
        <Text style={styles.address}>📍 {address}</Text>
      ) : null}

      {/* Envoyer */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>Envoyer le signalement</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f3f4f6' },
  content:       { padding: 20, paddingBottom: 40 },
  title:         { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  label:         { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input:         { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea:      { height: 100, textAlignVertical: 'top' },
  categories:    { flexDirection: 'row', marginBottom: 4 },
  catBtn:        { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: '#fff' },
  catBtnActive:  { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  catText:       { color: '#374151', fontSize: 14 },
  catTextActive: { color: '#fff' },
  locBtn:        { backgroundColor: '#059669', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
  locBtnText:    { color: '#fff', fontWeight: '600', fontSize: 15 },
  address:       { marginTop: 8, fontSize: 13, color: '#6b7280' },
  submitBtn:     { backgroundColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  btnDisabled:   { opacity: 0.6 },
  submitText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
});
