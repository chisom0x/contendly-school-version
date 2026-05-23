'use client';

import { useEffect, useState } from 'react';
import { NextClass } from '@/lib/types';
import { formatSessionDate, formatTimeRange, getCountdownParts } from '@/lib/utils';

interface NextClassCardProps {
  nextClass: NextClass;
}

export function NextClassCard({ nextClass }: NextClassCardProps) {
  const [countdown, setCountdown] = useState(() => getCountdownParts(nextClass.datetime));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownParts(nextClass.datetime));
    }, 1000);

    return () => clearInterval(timer);
  }, [nextClass.datetime]);

  return (
    <div className="rounded border border-border-dim border-l-4 border-l-neon-cyan bg-bg-surface p-5">
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-cyan">NEXT LIVE SESSION</p>

      <h3 className="mt-2 text-[17px] font-semibold leading-snug text-text-primary">{nextClass.title}</h3>

      <p className="mt-4 font-display text-[12px] uppercase tracking-[0.12em] text-neon-cyan">
        {formatSessionDate(nextClass.datetime)}
      </p>
      <p className="mt-1 font-display text-[22px] text-text-primary">{formatTimeRange(nextClass.datetime)}</p>

      <p className="mt-3 font-display text-[12px] uppercase tracking-[0.1em] text-text-secondary">
        {countdown.isLive
          ? 'Session is live now'
          : `Starts in ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`}
      </p>

      <button
        type="button"
        onClick={() => window.open(nextClass.zoomUrl, '_blank', 'noopener,noreferrer')}
        className="btn-primary mt-4 w-full"
      >
        JOIN CLASS ON ZOOM
      </button>

      <p className="mt-3 text-xs text-text-secondary">
        Ensure your camera and microphone are ready before joining.
      </p>
    </div>
  );
}
