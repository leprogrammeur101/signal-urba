import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useReports } from '../hooks/useReports';
import { reportsApi } from '../api/reports';
import StatusBadge from '../components/reports/StatusBadge';
import type { Report, ReportStatus } from '../types';

const ReportsMap = lazy(() => import('../components/map/ReportsMap'));

const STATUSES: { value: ReportStatus | ''; label: string }[] = [
  { value: '',            label: 'Tous'       },
  { value: 'NEW',         label: 'Nouveaux'   },
  { value: 'IN_PROGRESS', label: 'En cours'   },
  { value: 'RESOLVED',    label: 'Résolus'    },
];

export default function DashboardPage() {
  const { user, logout }                  = useAuthStore();
  const navigate                          = useNavigate();
  const [statusFilter, setStatusFilter]   = useState<ReportStatus | ''>('');
  const [selected, setSelected]           = useState<Report | null>(null);
  const [view, setView]                   = useState<'map' | 'list'>('map');

  const { reports, total, loading, refetch } = useReports({
    status: statusFilter || undefined,
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleStatusChange = async (status: ReportStatus) => {
    if (!selected) return;
    await reportsApi.updateStatus(selected.id, status);
    refetch();
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Signal'Urba</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Déconnexion
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-3 flex items-center gap-4">
        <span className="text-sm text-gray-500">{total} signalement(s)</span>

        {/* Filtres statut */}
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button key={s.value}
              onClick={() => setStatusFilter(s.value as ReportStatus | '')}
              className={`text-sm px-3 py-1 rounded-full border transition ${
                statusFilter === s.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Toggle vue */}
        <div className="ml-auto flex gap-2">
          <button onClick={() => setView('map')}
            className={`text-sm px-3 py-1 rounded ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            🗺 Carte
          </button>
          <button onClick={() => setView('list')}
            className={`text-sm px-3 py-1 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            📋 Liste
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 overflow-hidden">

        {/* Vue carte */}
        {view === 'map' && (
          <div className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">Chargement...</div>
            ) : (
              <Suspense fallback={<div className="flex items-center justify-center h-full">Chargement de la carte...</div>}>
                <ReportsMap reports={reports} onSelectReport={setSelected} />
              </Suspense>
            )}
          </div>
        )}

        {/* Vue liste */}
        {view === 'list' && (
          <div className="flex-1 p-4 overflow-y-auto">
            {loading ? (
              <p className="text-gray-400">Chargement...</p>
            ) : reports.length === 0 ? (
              <p className="text-gray-400">Aucun signalement</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id}
                    onClick={() => setSelected(r)}
                    className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{r.category.name}</p>
                        {r.title && <p className="text-sm text-gray-600">{r.title}</p>}
                        {r.address && <p className="text-xs text-gray-400 mt-1">{r.address}</p>}
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel détail */}
        {selected && (
          <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto border-l">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Détail</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-3">
              {selected.photoUrl && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Photo</p>
                  <a href={selected.photoUrl} target="_blank" rel="noreferrer">
                    <img
                      src={selected.photoUrl}
                      alt={selected.title || `Photo du signalement ${selected.id}`}
                      className="w-full h-44 object-cover rounded border border-gray-200"
                    />
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Catégorie</p>
                <p className="font-medium">{selected.category.name}</p>
              </div>
              {selected.title && (
                <div>
                  <p className="text-xs text-gray-400">Titre</p>
                  <p>{selected.title}</p>
                </div>
              )}
              {selected.description && (
                <div>
                  <p className="text-xs text-gray-400">Description</p>
                  <p className="text-sm">{selected.description}</p>
                </div>
              )}
              {selected.address && (
                <div>
                  <p className="text-xs text-gray-400">Adresse</p>
                  <p className="text-sm">{selected.address}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Statut actuel</p>
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Signalé par</p>
                <p className="text-sm">
                  {selected.user.firstName} {selected.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm">
                  {new Date(selected.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Changer le statut (admin) */}
              {user?.role === 'ADMIN' && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-400 mb-2">Changer le statut</p>
                  <div className="flex flex-col gap-2">
                    {(['NEW', 'IN_PROGRESS', 'RESOLVED'] as ReportStatus[])
                      .filter((s) => s !== selected.status)
                      .map((s) => (
                        <button key={s}
                          onClick={() => handleStatusChange(s)}
                          className="text-sm border rounded px-3 py-1 hover:bg-gray-50 transition text-left">
                          → {s === 'NEW' ? 'Nouveau' : s === 'IN_PROGRESS' ? 'En cours' : 'Résolu'}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
