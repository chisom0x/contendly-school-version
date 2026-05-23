'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { ClassRecordingsPanel } from '@/components/dashboard/ClassRecordingsPanel';
import { NextClassCard } from '@/components/dashboard/NextClassCard';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { WeekFilter, WeekFilterValue } from '@/components/dashboard/WeekFilter';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { getLearnerId } from '@/lib/auth';
import { mockData } from '@/lib/mockData';
import { Activity } from '@/lib/types';
import { getLearnerTasks, mergeActivitiesWithTaskRecords } from '@/lib/tasks-api';

type DashboardTab = 'missions' | 'recordings';

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>(mockData.activities);
  const [query, setQuery] = useState('');
  const [weekFilter, setWeekFilter] = useState<WeekFilterValue>('ALL');
  const [activeTab, setActiveTab] = useState<DashboardTab>('missions');

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

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const weekMatch = weekFilter === 'ALL' || activity.week === weekFilter;
      const loweredQuery = query.trim().toLowerCase();
      const queryMatch =
        loweredQuery.length === 0 ||
        activity.name.toLowerCase().includes(loweredQuery) ||
        activity.shortDescription.toLowerCase().includes(loweredQuery);

      return weekMatch && queryMatch;
    });
  }, [activities, query, weekFilter]);

  const completedActivities = activities.filter((activity) => activity.status === 'completed');
  const completionRatio = `${completedActivities.length} of ${activities.length} missions complete`;
  const overallProgressPct = Math.round((completedActivities.length / activities.length) * 100);

  const weekBreakdown = [1, 2, 3, 4].map((week) => {
    const weekActivities = activities.filter((activity) => activity.week === week);
    const weekCompleted = weekActivities.filter((activity) => activity.status === 'completed').length;

    return {
      week,
      complete: weekCompleted,
      total: weekActivities.length,
      pct: weekActivities.length === 0 ? 0 : Math.round((weekCompleted / weekActivities.length) * 100)
    };
  });

  return (
    <>
      <StatsBar activities={activities} />

      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6">
        <div className="mb-5 inline-flex rounded border border-border-dim bg-bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className={`rounded px-4 py-2 font-display text-[11px] uppercase tracking-[0.12em] transition-colors ${
              activeTab === 'missions'
                ? 'bg-neon-green text-bg-primary'
                : 'text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
            }`}
          >
            Missions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recordings')}
            className={`rounded px-4 py-2 font-display text-[11px] uppercase tracking-[0.12em] transition-colors ${
              activeTab === 'recordings'
                ? 'bg-neon-cyan text-bg-primary'
                : 'text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary'
            }`}
          >
            Class Recordings
          </button>
        </div>

        {activeTab === 'missions' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
            <section>
              <SectionLabel label="// ACTIVE MISSIONS" accent="green" className="mb-4" />

              <div className="mb-4 rounded border border-border-dim bg-bg-surface p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                  <div className="flex-1">
                    <SearchBar value={query} onChange={setQuery} />
                  </div>
                  <WeekFilter value={weekFilter} onChange={setWeekFilter} />
                </div>
              </div>

              <ActivityList activities={filteredActivities} />
            </section>

            <aside className="space-y-4">
              <SectionLabel label="// NEXT ONLINE CLASS" accent="cyan" className="mb-1" />
              <NextClassCard nextClass={mockData.nextClass} />

              <div className="rounded border border-border-dim bg-bg-surface p-5">
                <SectionLabel label="// MISSION PROGRESS" accent="green" className="mb-4" />

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-dim">
                  <div
                    className="h-full bg-neon-green transition-all duration-300"
                    style={{ width: `${overallProgressPct}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-text-secondary">{completionRatio}</p>

                <div className="mt-4 space-y-3">
                  {weekBreakdown.map((entry) => (
                    <div key={entry.week} className="grid grid-cols-[56px_1fr_auto] items-center gap-3">
                      <span className="font-display text-[11px] uppercase tracking-[0.1em] text-text-secondary">
                        Week {entry.week}
                      </span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-border-dim">
                        <div
                          className="h-full bg-neon-green transition-all duration-300"
                          style={{ width: `${entry.pct}%` }}
                        />
                      </div>
                      <span className="font-display text-[11px] uppercase tracking-[0.08em] text-neon-green">
                        {entry.complete}/{entry.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
            <section>
              <SectionLabel label="// PAST LIVE CLASS RECORDINGS" accent="cyan" className="mb-4" />
              <ClassRecordingsPanel recordings={mockData.pastRecordings} />
            </section>

            <aside className="space-y-4">
              <SectionLabel label="// NEXT ONLINE CLASS" accent="cyan" className="mb-1" />
              <NextClassCard nextClass={mockData.nextClass} />
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
