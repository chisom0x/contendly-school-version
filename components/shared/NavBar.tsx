'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearLearnerSession,
  getOperativeName,
  hasLearnerSession
} from '@/lib/auth';

export function NavBar() {
  const router = useRouter();
  const [operativeName, setOperativeName] = useState('ALPHA-7');

  useEffect(() => {
    setOperativeName(getOperativeName());
  }, []);

  useEffect(() => {
    let didExpire = false;

    const syncRemaining = () => {
      if (!hasLearnerSession()) {
        if (!didExpire) {
          didExpire = true;
          clearLearnerSession();
          router.replace('/access');
        }
        return;
      }
    };

    syncRemaining();
    const intervalId = window.setInterval(syncRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router]);

  const handleExit = () => {
    clearLearnerSession();
    router.push('/access');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-dim bg-bg-primary/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.06em] text-text-primary sm:text-base">
            <span className="text-neon-green">[</span>
            <span>CONTENDLY</span>
            <span className="text-neon-green">]</span>
          </div>
          <span className="hidden rounded-full border border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.1)] px-3 py-1 font-display text-[11px] uppercase tracking-[0.12em] text-neon-green md:inline-flex">
            OPERATIVE: {operativeName}
          </span>
        </div>

        <button type="button" onClick={handleExit} className="btn-ghost whitespace-nowrap">
          {'// EXIT MISSION'}
        </button>
      </div>
    </header>
  );
}
