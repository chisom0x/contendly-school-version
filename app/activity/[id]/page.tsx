'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Week1ActivityExperience } from '@/components/activity/week1/Week1ActivityExperience';
import { Week2ActivityExperience } from '@/components/activity/week2/Week2ActivityExperience';
import { Week3ActivityExperience } from '@/components/activity/week3/Week3ActivityExperience';
import { Week4ActivityExperience } from '@/components/activity/week4/Week4ActivityExperience';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TerminalCursor } from '@/components/shared/TerminalCursor';
import { getLearnerId, hasLearnerSession } from '@/lib/auth';
import { activityCoachContent } from '@/lib/activityCoachContent';
import { mockData } from '@/lib/mockData';
import { Activity } from '@/lib/types';
import { getLearnerTasks, getTaskFlag, mergeActivitiesWithTaskRecords, verifyTask } from '@/lib/tasks-api';
import { formatCompletionDate, isActivityAccessible } from '@/lib/utils';

const typeStyleMap = {
  puzzle: 'border-neon-cyan/40 text-neon-cyan bg-[rgba(0,229,255,0.08)]',
  linux: 'border-neon-green/45 text-neon-green bg-[rgba(0,255,136,0.08)]',
  game: 'border-[rgba(255,107,53,0.45)] text-alert-orange bg-[rgba(255,107,53,0.1)]',
  decode: 'border-[rgba(90,132,255,0.45)] text-[#90adff] bg-[rgba(90,132,255,0.12)]',
  web: 'border-[rgba(186,128,255,0.4)] text-[#c7a9ff] bg-[rgba(186,128,255,0.12)]',
  boss: 'border-alert-orange/45 text-alert-orange bg-[rgba(255,107,53,0.14)]',
  knowledge: 'border-border-bright text-text-secondary bg-[rgba(136,146,164,0.1)]'
} as const;

const verificationLines = [
  '[ok] receiving flag payload...',
  '[ok] validating mission checksum...',
  '[ok] cross-checking challenge context...'
];

export default function ActivityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(mockData.activities);
  const [flagInput, setFlagInput] = useState('');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [hintsOpen, setHintsOpen] = useState(false);
  const [revealedHintCount, setRevealedHintCount] = useState(0);
  const [discoveredFlag, setDiscoveredFlag] = useState<string | null>(null);
  const [taskFlag, setTaskFlag] = useState<string | null>(null);

  useEffect(() => {
    if (!hasLearnerSession()) {
      router.replace('/access');
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  const activity = useMemo(
    () => activities.find((item) => item.id === params.id),
    [activities, params.id]
  );
  const activityId = activity?.id;
  const activityName = activity?.name;

  useEffect(() => {
    setDiscoveredFlag(null);
    setTaskFlag(null);
    setFlagInput('');
    setResult(null);
    setFeedbackText('');
    setHintsOpen(false);
    setRevealedHintCount(0);
  }, [params.id]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

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
        // Keep local state when task sync fails.
      }
    };

    void syncTaskState();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized || !activityId || !activityName) {
      return;
    }

    const learnerId = getLearnerId();

    if (!learnerId) {
      return;
    }

    let isCancelled = false;

    const syncTaskFlag = async () => {
      try {
        const resolvedFlag = await getTaskFlag(learnerId, activityName);

        if (isCancelled) {
          return;
        }

        setTaskFlag(resolvedFlag);
        setActivities((previous) =>
          previous.map((item) =>
            item.id === activityId
              ? item.flag === resolvedFlag
                ? item
                : {
                    ...item,
                    flag: resolvedFlag
                  }
              : item
          )
        );
      } catch {
        // Keep local challenge flag when endpoint fails.
      }
    };

    void syncTaskFlag();

    return () => {
      isCancelled = true;
    };
  }, [activityId, activityName, isAuthorized]);

  const canSubmit = activity ? isActivityAccessible(activity.status) && activity.status !== 'completed' : false;
  const challengeFlag = taskFlag ?? activity?.flag ?? '';
  const coachContent = activity ? activityCoachContent[activity.id] : null;
  const missionDescription = coachContent?.description ?? activity?.fullDescription ?? '';
  const missionSteps = coachContent?.steps ?? [];
  const missionHints = coachContent?.hints ?? activity?.hints ?? [];

  const handleSubmitFlag = async () => {
    if (!activity || !canSubmit || !flagInput.trim()) {
      return;
    }

    const learnerId = getLearnerId();

    if (!learnerId) {
      setResult('error');
      setFeedbackText('[err] SESSION EXPIRED - REAUTHENTICATE TO SUBMIT');
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setFeedbackText('');
    setLogLines([]);

    for (const line of verificationLines) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setLogLines((prev) => [...prev, line]);
    }

    try {
      const verification = await verifyTask({
        userId: learnerId,
        taskName: activity.name,
        flag: flagInput.trim(),
        points: activity.points
      });

      if (!verification.verified) {
        setResult('error');
        setFeedbackText('[err] INCORRECT FLAG - try again');
        setIsSubmitting(false);
        return;
      }

      setResult('success');
      setFeedbackText(`[ok] FLAG ACCEPTED - +${activity.points} pts awarded`);
      setActivities((previous) =>
        previous.map((item) =>
          item.id === activity.id
            ? {
                ...item,
                status: 'completed',
                completedAt: item.completedAt ?? new Date().toISOString()
              }
            : item
        )
      );

      try {
        const taskRecords = await getLearnerTasks(learnerId);
        setActivities((previous) => mergeActivitiesWithTaskRecords(previous, taskRecords));
      } catch {
        // Local completion state is already set.
      }
    } catch (error) {
      const errorText =
        error instanceof Error && error.message === 'TASK_NETWORK_ERROR'
          ? '[err] NETWORK ERROR - VERIFY CONNECTION AND RETRY'
          : '[err] VERIFICATION FAILED - TRY AGAIN';

      setResult('error');
      setFeedbackText(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeek1FlagDiscovered = (flag: string) => {
    setDiscoveredFlag(flag);
    setFlagInput(flag);
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">
          [ok] syncing mission state...
        </p>
      </div>
    );
  }

  if (!activity) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[860px] px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="font-display text-[11px] uppercase tracking-[0.15em] text-neon-green"
        >
          ← BACK TO DASHBOARD
        </button>

        <div className="mt-4 rounded border border-border-dim bg-bg-surface p-6">
          <p className="font-display text-[11px] uppercase tracking-[0.15em] text-alert-orange">
            {'// MISSION NOT FOUND'}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            This challenge record could not be loaded. Return to the dashboard and re-open a mission.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[860px] px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="font-display text-[11px] uppercase tracking-[0.15em] text-neon-green transition-colors hover:text-neon-green-dim"
      >
        ← BACK TO DASHBOARD
      </button>

      <article
        className={`mt-4 rounded border border-border-dim bg-bg-surface p-6 ${
          result === 'success' ? 'animate-flash' : ''
        }`}
      >
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

        <h1 className="mt-4 font-display text-[20px] text-text-primary">{activity.name}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span
            className={`rounded-sm border px-2 py-1 font-display text-[10px] uppercase tracking-[0.1em] ${
              typeStyleMap[activity.type]
            }`}
          >
            {activity.type}
          </span>
          <span className="font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
            +{activity.points} pts
          </span>
        </div>

        <div className="mt-5 border-t border-border-dim pt-5">
          <SectionLabel label="// MISSION BRIEF" accent="green" className="mb-3" />
          <p className="text-[15px] leading-relaxed text-text-secondary">{missionDescription}</p>
          {missionSteps.length > 0 && (
            <div className="mt-4 rounded border border-[rgba(0,229,255,0.22)] bg-[rgba(0,229,255,0.06)] p-4">
              <p className="font-display text-[10px] uppercase tracking-[0.13em] text-neon-cyan">
                {'// STEP-BY-STEP GUIDE'}
              </p>
              <ol className="mt-3 space-y-2 text-sm text-text-primary">
                {missionSteps.map((step, index) => (
                  <li key={step} className="flex gap-2">
                    <span className="font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {activity.week === 1 && (
          <>
            <Week1ActivityExperience
              activityId={activity.id}
              challengeFlag={challengeFlag}
              onFlagDiscovered={handleWeek1FlagDiscovered}
            />
            {discoveredFlag && (
              <p className="mt-3 rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
                [ok] simulator extracted mission flag: {discoveredFlag}
              </p>
            )}
          </>
        )}

        {activity.week === 2 && (
          <Week2ActivityExperience
            activityId={activity.id}
            challengeFlag={challengeFlag}
            onFlagDiscovered={(flag) => setDiscoveredFlag(flag)}
          />
        )}

        {activity.week === 3 && (
          <Week3ActivityExperience
            activityId={activity.id}
            challengeFlag={challengeFlag}
            onFlagDiscovered={(flag) => setDiscoveredFlag(flag)}
          />
        )}

        {activity.week === 4 && (
          <Week4ActivityExperience
            activityId={activity.id}
            challengeFlag={challengeFlag}
            onFlagDiscovered={(flag) => setDiscoveredFlag(flag)}
          />
        )}

        {discoveredFlag && (activity.week === 2 || activity.week === 3 || activity.week === 4) && (
          <p className="mt-3 rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
            [ok] simulator extracted mission flag: {discoveredFlag}
          </p>
        )}

        <div className="mt-6 border-t border-border-dim pt-5">
          <SectionLabel label="// SUBMIT FLAG" accent="cyan" className="mb-3" />

          {activity.status === 'completed' ? (
            <div className="rounded border border-[rgba(0,255,136,0.4)] bg-[rgba(0,255,136,0.08)] p-4">
              <p className="font-display text-[12px] uppercase tracking-[0.12em] text-neon-green">
                [ok] MISSION COMPLETE - FLAG ACCEPTED
              </p>
              {activity.completedAt && (
                <p className="mt-1 text-sm text-text-secondary">
                  Completed at {formatCompletionDate(activity.completedAt)} WAT
                </p>
              )}
            </div>
          ) : canSubmit ? (
            <>
              <p className="mb-2 flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">
                kid@defender:~$ submit --flag
                <TerminalCursor className="h-[11px] w-[6px] bg-neon-green" />
              </p>

              <input
                value={flagInput}
                onChange={(event) => setFlagInput(event.target.value)}
                placeholder="FLAG{...}"
                className="terminal-input"
                autoComplete="off"
                disabled={isSubmitting}
              />

              <button
                type="button"
                onClick={handleSubmitFlag}
                disabled={isSubmitting || !flagInput.trim()}
                className="btn-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FLAG'}
              </button>

              {isSubmitting && (
                <div className="mt-3 space-y-2 rounded border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.06)] p-3 font-display text-xs text-neon-green">
                  {logLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}

              {result && (
                <p
                  className={`mt-3 rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.12em] ${
                    result === 'success'
                      ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
                      : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
                  }`}
                >
                  {feedbackText}
                </p>
              )}
            </>
          ) : (
            <div className="rounded border border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)] p-4">
              <p className="font-display text-[11px] uppercase tracking-[0.13em] text-alert-orange">
                {'// MISSION LOCKED - Clearance required before submission.'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-border-dim pt-5">
          <button
            type="button"
            onClick={() => setHintsOpen((prev) => !prev)}
            className="btn-ghost"
          >
            {`// HINTS ${hintsOpen ? '[-]' : '[+]'} `}
          </button>

          {hintsOpen && (
            <div className="mt-4 space-y-3">
              {missionHints.map((hint, index) => (
                <div key={hint} className="rounded border border-border-dim bg-bg-surface-2 p-3">
                  {index < revealedHintCount ? (
                    <>
                      <p className="text-sm text-text-secondary">{hint}</p>
                      <p className="mt-2 font-display text-[10px] uppercase tracking-[0.13em] text-alert-orange">
                        Hint used - this will affect your final score
                      </p>
                    </>
                  ) : index === revealedHintCount ? (
                    <button
                      type="button"
                      onClick={() => setRevealedHintCount((prev) => prev + 1)}
                      className="btn-ghost"
                    >
                      REVEAL HINT {index + 1}
                    </button>
                  ) : (
                    <p className="font-display text-[10px] uppercase tracking-[0.13em] text-text-dim">
                      Hint {index + 1} locked
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
