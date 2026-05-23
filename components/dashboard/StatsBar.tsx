import { Activity } from '@/lib/types';

interface StatsBarProps {
  activities: Activity[];
}

export function StatsBar({ activities }: StatsBarProps) {
  const totalMissions = activities.length;
  const completedCount = activities.filter((activity) => activity.status === 'completed').length;
  const totalScore = activities
    .filter((activity) => activity.status === 'completed')
    .reduce((sum, activity) => sum + activity.points, 0);

  const stats = [
    { value: totalMissions, label: 'TOTAL MISSIONS' },
    { value: completedCount, label: 'COMPLETED' },
    { value: totalScore.toLocaleString(), label: 'TOTAL SCORE' }
  ];

  return (
    <section className="border-b border-border-dim bg-bg-surface">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-4 sm:px-6 md:flex-row md:items-center">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="flex flex-1 items-center justify-between py-2 md:justify-center md:py-0"
          >
            <div className="text-left md:text-center">
              <p className="font-display text-3xl font-bold text-neon-green">[{stat.value}]</p>
              <p className="font-display text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                {stat.label}
              </p>
            </div>
            {index < stats.length - 1 && (
              <span className="ml-6 hidden h-12 w-px bg-border-dim md:inline-block" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
