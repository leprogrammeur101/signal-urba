import api from '../api/client';

// Les notifications push nécessitent un build natif (pas Expo Go)
// Elles seront activées lors du déploiement avec EAS Build

export async function registerForPushNotifications(): Promise<string | null> {
  console.log('Notifications push disponibles uniquement en build natif');
  return null;
}