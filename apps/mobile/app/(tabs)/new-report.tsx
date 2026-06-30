import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { reportsApi } from '../../api/reports';
import { categoriesApi } from '../../api/categories';
import { useAuthStore } from '../../store/auth.store';
import type { Category } from '../../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// Géocodage inverse Nominatim
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=fr`,
      { headers: { 'User-Agent': 'SignalUrba/1.0' } }
    );
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      const parts = [
        a.neighbourhood || a.suburb || a.quarter || a.hamlet,
        a.road || a.pedestrian,
        a.city || a.town || a.village,
      ].filter(Boolean);
      return parts.join(', ') || data.display_name;
    }
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

// Upload vers Cloudinary via l'API backend
// On utilise fetch() natif plutôt qu'Axios pour l'upload multipart :
// quand on passe Content-Type manuellement à Axios, l'intercepteur Authorization
// peut être ignoré. fetch() + FormData RN envoie les deux headers correctement.
async function uploadPhoto(uri: string): Promise<string> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) throw new Error('Non authentifié');

  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const match    = /\.(\w+)$/.exec(filename);
  const type     = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', { uri, name: filename, type } as any);

  // Ne pas forcer Content-Type : fetch() génère automatiquement
  // le bon boundary multipart/form-data
  const response = await fetch(`${API_URL}/uploads/image`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erreur serveur ${response.status}`);
  }

  const data = await response.json();
  return data.url;
}

export default function NewReportScreen() {
  const { accessToken } = useAuthStore();
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [categoryId,  setCategoryId]  = useState('');
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [location,    setLocation]    = useState<{ lat: number; lon: number } | null>(null);
  const [address,     setAddress]     = useState('');
  const [photoUri,    setPhotoUri]    = useState<string | null>(null);
  const [photoUrl,    setPhotoUrl]    = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [locLoading,  setLocLoading]  = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const getLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorise la géolocalisation');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setLocation({ lat: latitude, lon: longitude });
      const addr = await reverseGeocode(latitude, longitude);
      setAddress(addr);
    } catch {
      Alert.alert('Erreur', 'Impossible de récupérer ta position');
    } finally {
      setLocLoading(false);
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorise l\'accès à la galerie');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality:    0.8,
      allowsEditing: true,
      aspect:     [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      setUploading(true);
      try {
        const url = await uploadPhoto(uri);
        setPhotoUrl(url);
        Alert.alert('✅', 'Photo uploadée avec succès');
      } catch {
        Alert.alert('Erreur', 'Impossible d\'uploader la photo');
        setPhotoUri(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorise l\'accès à la caméra');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality:       0.8,
      allowsEditing: true,
      aspect:        [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      setUploading(true);
      try {
        const url = await uploadPhoto(uri);
        setPhotoUrl(url);
        Alert.alert('✅', 'Photo uploadée avec succès');
      } catch {
        Alert.alert('Erreur', 'Impossible d\'uploader la photo');
        setPhotoUri(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) {
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
        title:       title       || undefined,
        description: description || undefined,
        address:     address     || undefined,
        photoUrl:    photoUrl    || undefined,
      });
      Alert.alert('✅ Signalement envoyé !', 'Merci pour ta contribution.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/my-reports') },
      ]);
      setCategoryId(''); setTitle(''); setDescription('');
      setLocation(null); setAddress(''); setPhotoUri(null); setPhotoUrl(null);
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
      <TextInput style={styles.input} placeholder="Ex: Nid de poule" value={title} onChangeText={setTitle} />

      {/* Description */}
      <Text style={styles.label}>Description (optionnel)</Text>
      <TextInput style={[styles.input, styles.textarea]} placeholder="Décris le problème..." value={description} onChangeText={setDescription} multiline numberOfLines={3} />

      {/* Photo */}
      <Text style={styles.label}>Photo (optionnel)</Text>
      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto} disabled={uploading}>
          <Text style={styles.photoBtnText}>📷 Caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto} disabled={uploading}>
          <Text style={styles.photoBtnText}>🖼 Galerie</Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingBox}>
          <ActivityIndicator color="#2563eb" />
          <Text style={styles.uploadingText}>Upload en cours...</Text>
        </View>
      )}

      {photoUri && !uploading && (
        <View style={styles.photoPreview}>
          <Image source={{ uri: photoUri }} style={styles.previewImg} />
          <TouchableOpacity style={styles.removePhoto} onPress={() => { setPhotoUri(null); setPhotoUrl(null); }}>
            <Text style={styles.removePhotoText}>✕ Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Géolocalisation */}
      <Text style={styles.label}>Localisation *</Text>
      <TouchableOpacity style={styles.locBtn} onPress={getLocation} disabled={locLoading}>
        {locLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.locBtnText}>
              {location ? '📍 Position récupérée — Appuie pour actualiser' : '📍 Récupérer ma position'}
            </Text>
        }
      </TouchableOpacity>

      {address ? (
        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>📍 Adresse détectée :</Text>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      ) : null}

      {/* Envoyer */}
      <TouchableOpacity
        style={[styles.submitBtn, (loading || uploading || !categoryId || !location) && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading || uploading || !categoryId || !location}
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
  container:    { flex: 1, backgroundColor: '#f3f4f6' },
  content:      { padding: 20, paddingBottom: 40 },
  title:        { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  label:        { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input:        { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea:     { height: 80, textAlignVertical: 'top' },
  catBtn:       { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: '#fff' },
  catBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  catText:      { color: '#374151', fontSize: 14 },
  catTextActive:{ color: '#fff' },
  photoRow:     { flexDirection: 'row', gap: 10, marginTop: 4 },
  photoBtn:     { flex: 1, backgroundColor: '#e5e7eb', borderRadius: 8, padding: 12, alignItems: 'center' },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  uploadingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  uploadingText:{ color: '#6b7280', fontSize: 13 },
  photoPreview: { marginTop: 10, alignItems: 'center' },
  previewImg:   { width: '100%', height: 180, borderRadius: 8, resizeMode: 'cover' },
  removePhoto:  { marginTop: 6 },
  removePhotoText: { color: '#ef4444', fontSize: 13 },
  locBtn:       { backgroundColor: '#059669', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
  locBtnText:   { color: '#fff', fontWeight: '600', fontSize: 14 },
  addressBox:   { marginTop: 10, backgroundColor: '#ecfdf5', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#6ee7b7' },
  addressLabel: { fontSize: 12, color: '#065f46', fontWeight: '600', marginBottom: 4 },
  addressText:  { fontSize: 14, color: '#064e3b' },
  submitBtn:    { backgroundColor: '#2563eb', borderRadius: 8, padding:16, alignItems: 'center', marginTop: 24 },
  btnDisabled:  { opacity: 0.5 },
  submitText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});