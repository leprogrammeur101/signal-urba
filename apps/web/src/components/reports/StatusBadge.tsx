import type { ReportStatus } from '../../types';

const CONFIG: Record<ReportStatus, { label: string; className: string }> = {
  NEW:         { label: 'Nouveau',    className: 'bg-blue-100 text-blue-800'  },
  IN_PROGRESS: { label: 'En cours',   className: 'bg-yellow-100 text-yellow-800' },
  RESOLVED:    { label: 'Résolu',     className: 'bg-green-100 text-green-800' },
};

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
}
