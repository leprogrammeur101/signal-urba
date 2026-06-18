import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen name="index"      options={{ title: 'Carte',           tabBarLabel: 'Carte'      }} />
      <Tabs.Screen name="new-report" options={{ title: 'Signaler',        tabBarLabel: 'Signaler'   }} />
      <Tabs.Screen name="my-reports" options={{ title: 'Mes signalements', tabBarLabel: 'Mes reports' }} />
    </Tabs>
  );
}
