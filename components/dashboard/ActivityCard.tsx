'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Activity } from '@/lib/types';
import { formatOpenDateLine, isActivityAccessible } from '@/lib/utils';

interface ActivityCardProps {
  activity: Activity;
}

const typeStyleMap: Record<Activity['type'], string> = {
  puzzle: 'border-neon-cyan/40 text-neon-cyan bg-[rgba(0,229,255,0.08)]',
  linux: 'border-neon-green/45 text-neon-green bg-[rgba(0,255,136,0.08)]',
  game: 'border-[rgba(255,107,53,0.45)] text-alert-orange bg-[rgba(255,107,53,0.1)]',
  decode: 'border-[rgba(90,132,255,0.45)] text-[#90adff] bg-[rgba(90,132,255,0.12)]',
  web: 'border-[rgba(186,128,255,0.4)] text-[#c7a9ff] bg-[rgba(186,128,255,0.12)]',
  boss: 'border-alert-orange/45 text-alert-orange bg-[rgba(255,107,53,0.14)]',
  knowledge: 'border-border-bright text-text-secondary bg-[rgba(136,146,164,0.1)]'
};

const accentMap = {
  completed: 'bg-neon-green',
  in_progress: 'bg-neon-cyan',
  open: 'bg-neon-cyan',
  locked: 'bg-text-dim',
  scheduled: 'bg-alert-orange'
} as const;

export function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter();
  const [isShaking, setIsShaking] = useState(false);

  const isAccessible = isActivityAccessible(activity.status);

  const handleClick = () => {
    if (isAccessible) {
      router.push(`/activity/${activity.id}`);
      return;
    }

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 350);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      className={`group relative overflow-hidden rounded border border-border-dim bg-bg-surface px-5 py-4 transition-all duration-200 ${
        activity.isBoss ? 'border-t-2 border-t-alert-orange/80' : ''
      } ${
        isAccessible
          ? 'cursor-pointer hover:border-border-bright hover:shadow-panel-soft'
          : 'cursor-not-allowed opacity-90'
      } ${isShaking ? 'animate-shake' : ''}`}
      aria-label={`Open ${activity.name}`}
      aria-disabled={!isAccessible}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-1 transition-opacity duration-200 ${accentMap[activity.status]} ${
          isAccessible ? 'opacity-0 group-hover:opacity-100' : 'opacity-50'
        }`}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          [WEEK {activity.week} - {activity.challengeNum}]
        </p>
        <StatusBadge
          status={activity.status}
          scheduledOpenAt={activity.scheduledOpenAt}
          isBoss={activity.isBoss}
        />
      </div>

      <div className="mt-3">
        <h3 className="text-[15px] font-semibold text-text-primary">{activity.name}</h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-text-secondary">{activity.shortDescription}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-sm border px-2 py-1 font-display text-[10px] uppercase tracking-[0.1em] ${typeStyleMap[activity.type]}`}
        >
          {activity.type}
        </span>

        {activity.status === 'scheduled' && activity.scheduledOpenAt ? (
          <span className="font-display text-[11px] uppercase tracking-[0.08em] text-alert-orange">
            OPENS: {formatOpenDateLine(activity.scheduledOpenAt)}
          </span>
        ) : activity.status === 'locked' ? (
          <span className="font-display text-[11px] uppercase tracking-[0.08em] text-text-dim">LOCKED</span>
        ) : (
          <span className="font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
            +{activity.points} pts
          </span>
        )}
      </div>
    </article>
  );
}
