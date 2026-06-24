import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface MapMarker {
  id:        string;
  latitude:  number;
  longitude: number;
  status:    string;
  title?:    string;
  category:  string;
}

interface Props {
  markers:        MapMarker[];
  centerLat?:     number;
  centerLon?:     number;
  zoom?:          number;
}

const STATUS_COLORS: Record<string, string> = {
  NEW:         '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  RESOLVED:    '#10b981',
};

function buildHtml(markers: MapMarker[], centerLat: number, centerLon: number, zoom: number) {
  const markersJs = markers.map((m) => {
    const color = STATUS_COLORS[m.status] ?? '#6b7280';
    const label = m.status === 'NEW' ? 'Nouveau' : m.status === 'IN_PROGRESS' ? 'En cours' : 'Résolu';
    return `
      L.circleMarker([${m.latitude}, ${m.longitude}], {
        radius: 10, color: '${color}', fillColor: '${color}',
        fillOpacity: 0.8, weight: 2
      })
      .bindPopup('<b>${m.category}</b><br/>${m.title ?? ''}<br/><span style="color:${color}">${label}</span>')
      .addTo(map);
    `;
  }).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${centerLat}, ${centerLon}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    ${markersJs}
  </script>
</body>
</html>
  `;
}

export default function LeafletMap({
  markers,
  centerLat = 5.3600,
  centerLon = -4.0083,
  zoom      = 13,
}: Props) {
  const html = buildHtml(markers, centerLat, centerLon, zoom);

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },
});
