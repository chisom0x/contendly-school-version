import { ActivityStatus } from '@/lib/types';
import { formatStatusDate } from '@/lib/utils';

interface StatusBadgeProps {
  status: ActivityStatus;
  scheduledOpenAt?: string;
  isBoss?: boolean;
}

const styleMap: Record<ActivityStatus, string> = {
  completed: 'text-neon-green bg-[rgba(0,255,136,0.1)] border-[rgba(0,255,136,0.35)]',
  in_progress: 'text-neon-cyan bg-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.35)]',
  open: 'text-text-primary bg-[rgba(90,132,255,0.14)] border-[rgba(90,132,255,0.36)]',
  locked: 'text-text-dim bg-[rgba(74,85,104,0.16)] border-[rgba(74,85,104,0.34)]',
  scheduled: 'text-alert-orange bg-[rgba(255,107,53,0.12)] border-[rgba(255,107,53,0.35)]'
};

function getStatusLabel(status: ActivityStatus, scheduledOpenAt?: string): string {
  if (status === 'completed') return '✓ COMPLETED';
  if (status === 'in_progress') return '◈ IN PROGRESS';
  if (status === 'open') return '▶ OPEN';
  if (status === 'locked') return '⊘ LOCKED';

  const formattedDate = scheduledOpenAt ? formatStatusDate(scheduledOpenAt) : 'TBA';
  return `◷ OPENS ${formattedDate}`;
}

export function StatusBadge({ status, scheduledOpenAt, isBoss = false }: StatusBadgeProps) {
  const statusText = getStatusLabel(status, scheduledOpenAt);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] ${styleMap[status]}`}
    >
      {isBoss && <span className="text-alert-orange">BOSS CHALLENGE</span>}
      <span>{statusText}</span>
    </span>
  );
}
