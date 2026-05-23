import { Activity } from '@/lib/types';
import { ActivityCard } from '@/components/dashboard/ActivityCard';

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  if (!activities.length) {
    return (
      <div className="rounded border border-border-dim bg-bg-surface p-6 text-center">
        <p className="font-display text-[11px] uppercase tracking-[0.15em] text-neon-cyan">
          {'// NO MATCHING MISSIONS'}
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Refine your search query or switch week filters to recover mission targets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
