'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { getLearnerId, getSessionRemainingMs, hasLearnerSession } from '@/lib/auth';
import { mockData } from '@/lib/mockData';
import { Activity } from '@/lib/types';
import { getLearnerTasks, mergeActivitiesWithTaskRecords } from '@/lib/tasks-api';

function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>(mockData.activities);
  const [query, setQuery] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const learnerId = getLearnerId();

    if (!learnerId) {
      return;
    }

    let isCancelled = false;

    const syncTaskState = async () => {
      try {
        const taskRecords = await getLearnerTasks(learnerId);

        if (isCancelled) {
          return;
        }

        setActivities((previous) => mergeActivitiesWithTaskRecords(previous, taskRecords));
      } catch {
        // Keep local mock status if task sync fails.
      }
    };

    void syncTaskState();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncRemaining = () => {
      if (!hasLearnerSession()) {
        router.replace('/access');
        return;
      }

      const remainingMs = getSessionRemainingMs();
      setRemainingSeconds(Math.ceil(remainingMs / 1000));
    };

    syncRemaining();
    const intervalId = window.setInterval(syncRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const loweredQuery = query.trim().toLowerCase();
      const queryMatch =
        loweredQuery.length === 0 ||
        activity.name.toLowerCase().includes(loweredQuery) ||
        activity.shortDescription.toLowerCase().includes(loweredQuery);

      return queryMatch;
    });
  }, [activities, query]);

  return (
    <>
      <StatsBar activities={activities} />

      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <section>
            <SectionLabel label="// ACTIVE MISSIONS" accent="green" className="mb-4" />

            {activities.length > 0 && (
              <div className="mb-4 rounded border border-border-dim bg-bg-surface p-4">
                <div className="flex-1">
                  <SearchBar value={query} onChange={setQuery} />
                </div>
              </div>
            )}

            <ActivityList activities={filteredActivities} hasCatalogActivities={activities.length > 0} />
          </section>

          <aside>
            <div className="rounded border border-border-dim bg-bg-surface p-5">
              <SectionLabel label="// SESSION TIMER" accent="cyan" className="mb-4" />
              <div className="rounded border-2 border-alert-orange bg-[rgba(255,107,53,0.16)] px-4 py-4 text-center shadow-[0_0_24px_rgba(255,107,53,0.2)]">
                <p className="font-display text-[11px] uppercase tracking-[0.14em] text-alert-orange">
                  30-MIN SESSION
                </p>
                <p className="mt-2 font-display text-5xl font-bold tracking-[0.1em] text-alert-orange">
                  {formatCountdown(remainingSeconds)}
                </p>
                <p className="mt-2 text-xs text-text-secondary">
                  You will return to access screen when the timer ends.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
