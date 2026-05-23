import { Activity } from '@/lib/types';
import { ActivityCard } from '@/components/dashboard/ActivityCard';

interface ActivityListProps {
  activities: Activity[];
  hasCatalogActivities: boolean;
}

export function ActivityList({ activities, hasCatalogActivities }: ActivityListProps) {
  if (!activities.length) {
    return (
      <div className="rounded border border-border-dim bg-bg-surface p-6 text-center">
        {hasCatalogActivities ? (
          <>
            <p className="font-display text-[11px] uppercase tracking-[0.15em] text-neon-cyan">
              {'// NO MATCHING MISSIONS'}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Refine your search query or switch week filters to recover mission targets.
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-[11px] uppercase tracking-[0.15em] text-alert-orange">
              {'// NO MISSIONS CONFIGURED'}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Activities have been cleared. Add new activities to begin building the next mission set.
            </p>
          </>
        )}
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
