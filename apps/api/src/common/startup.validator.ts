/**
 * Vérifie que les variables d'environnement critiques sont définies
 * et non triviales avant de démarrer l'application.
 */
export function validateStartupConfig() {
  const required = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const weak = ['change_me', 'secret', 'password', '123456', 'changeme'];

  const missing: string[] = [];
  const insecure: string[] = [];

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else if (weak.some((w) => value.toLowerCase().includes(w))) {
      insecure.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
    process.exit(1);
  }

  if (insecure.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`❌ Variables d'environnement non sécurisées en production : ${insecure.join(', ')}`);
    console.error('   Générez des secrets forts : openssl rand -base64 64');
    process.exit(1);
  }

  if (insecure.length > 0) {
    console.warn(`⚠️  Secrets faibles détectés (OK en dev) : ${insecure.join(', ')}`);
  }
}
