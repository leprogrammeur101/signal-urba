import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../store/auth.store';

export default function RootLayout() {
  const { loadFromStorage, isLoading, accessToken } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Redirection selon l'état d'auth
  useEffect(() => {
    if (!isLoading) {
      if (accessToken) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, accessToken]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
