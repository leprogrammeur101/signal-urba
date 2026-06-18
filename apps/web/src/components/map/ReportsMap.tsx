import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Report } from '../../types';
import StatusBadge from '../reports/StatusBadge';

// Fix icône Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Props {
  reports:         Report[];
  onSelectReport?: (report: Report) => void;
}

export default function ReportsMap({ reports, onSelectReport }: Props) {
  return (
    <MapContainer
      center={[5.3600, -4.0083]}
      zoom={12}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
      />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          eventHandlers={{ click: () => onSelectReport?.(report) }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{report.category.name}</p>
              {report.title && <p className="text-gray-600">{report.title}</p>}
              <StatusBadge status={report.status} />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
