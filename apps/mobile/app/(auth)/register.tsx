import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth.store';

export default function RegisterScreen() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Email et mot de passe obligatoires');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(email, password, firstName, lastName);
      await setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Signal'Urba</Text>
          <Text style={styles.subtitle}>Créer un compte</Text>

          <TextInput style={styles.input} placeholder="Prénom"    value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Nom"       value={lastName}  onChangeText={setLastName}  />
          <TextInput style={styles.input} placeholder="Email"     value={email}     onChangeText={setEmail}     keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Mot de passe (8 car. min)" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Inscription...' : "S'inscrire"}</Text>
          </TouchableOpacity>

          <Link href="/(auth)/login" style={styles.link}>
            Déjà un compte ? Se connecter
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f3f4f6' },
  scroll:      { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title:       { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle:    { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  input:       { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  btn:         { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontWeight: '600', fontSize: 16 },
  link:        { textAlign: 'center', marginTop: 16, color: '#2563eb' },
});
