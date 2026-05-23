'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { TerminalCursor } from '@/components/shared/TerminalCursor';

interface Week2ActivityExperienceProps {
  activityId: string;
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

interface GameProps {
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

interface FootprintAnswer {
  fullName: string;
  school: string;
  neighbourhood: string;
  routine: string;
  workplace: string;
}

interface PhishMessage {
  id: string;
  sender: string;
  channel: 'email' | 'sms';
  subject: string;
  body: string;
  verdict: 'safe' | 'phish';
  explanation: string;
}

interface BossTactic {
  id: string;
  label: string;
  excerpt: string;
}

type PrivacyLevel = 'allowed' | 'limited' | 'off';

const panelClassName = 'rounded border border-border-dim bg-bg-surface-2 p-4';
const TWO_FA_CHECKPOINTS = [
  { id: 'gate-a', label: 'Checkpoint A', requiredTower: 'security-key' },
  { id: 'gate-b', label: 'Checkpoint B', requiredTower: 'auth-app' },
  { id: 'gate-c', label: 'Checkpoint C', requiredTower: 'backup-codes' }
] as const;
const TWO_FA_WAVES = [
  'brute force',
  'phishing',
  'credential stuffing',
  'phishing',
  'brute force',
  'credential stuffing',
  'phishing',
  'credential stuffing',
  'brute force',
  'phishing'
] as const;
const TWO_FA_ATTACK_REQUIREMENTS = {
  'brute force': 'security-key',
  phishing: 'auth-app',
  'credential stuffing': 'backup-codes'
} as const;
const TWO_FA_TOWER_OPTIONS = [
  { id: 'security-key', label: 'Security key tower' },
  { id: 'auth-app', label: 'Authenticator app tower' },
  { id: 'backup-codes', label: 'Backup codes tower' }
] as const;

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shuffleList<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function useOneTimeUnlock(challengeFlag: string, onFlagDiscovered: (flag: string) => void) {
  const hasUnlockedRef = useRef(false);

  const unlock = useCallback(() => {
    if (hasUnlockedRef.current) {
      return;
    }

    hasUnlockedRef.current = true;
    onFlagDiscovered(challengeFlag);
  }, [challengeFlag, onFlagDiscovered]);

  return { unlock };
}

function Week2ChallengeShell({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="rounded border border-[rgba(186,128,255,0.25)] bg-[linear-gradient(180deg,rgba(10,14,26,0.95),rgba(15,20,32,0.98))] p-4 shadow-[0_0_0_1px_rgba(0,229,255,0.05),0_16px_32px_rgba(0,0,0,0.24)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <SectionLabel label="// WEEK 2 OPERATIONS" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            cyber-awareness training bay
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

function Week2MissionUnavailable({ activityId }: { activityId: string }) {
  return (
    <div className={panelClassName}>
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-alert-orange">
        {'// SIMULATOR MODULE NOT LOADED'}
      </p>
      <p className="mt-2 text-sm text-text-secondary">No dedicated week 2 experience is mapped to {activityId}.</p>
    </div>
  );
}

function FootprintFinderGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const clues = [
    {
      key: 'fullName',
      title: 'Social profile',
      clue: 'The profile header says "Amara O." and the about section mentions she loves debate club.'
    },
    {
      key: 'school',
      title: 'School club page',
      clue: 'The student council post lists her year group at Riverbend Academy and tags her as house captain.'
    },
    {
      key: 'neighbourhood',
      title: 'Gaming forum post',
      clue: 'A username signature references the Maple Grove bus stop and a long walk home after practice.'
    },
    {
      key: 'routine',
      title: 'Photo caption',
      clue: 'The caption says she "heads to football training after class, then edits video clips at night."'
    },
    {
      key: 'workplace',
      title: 'Parent shoutout',
      clue: 'A birthday post thanks "Dad at BrightLine Logistics" for staying late to pick up the cake.'
    }
  ] as const;

  const correctAnswers: FootprintAnswer = {
    fullName: 'amara okafor',
    school: 'riverbend academy',
    neighbourhood: 'maple grove',
    routine: 'football training after class',
    workplace: 'brightline logistics'
  };

  const [answers, setAnswers] = useState<FootprintAnswer>({
    fullName: '',
    school: '',
    neighbourhood: '',
    routine: '',
    workplace: ''
  });
  const [correctMap, setCorrectMap] = useState<Record<keyof FootprintAnswer, boolean>>({
    fullName: false,
    school: false,
    neighbourhood: false,
    routine: false,
    workplace: false
  });
  const [feedback, setFeedback] = useState('');

  const revealedChars = ['T', 'R', 'A', 'C', 'E'];
  const revealedWord = revealedChars
    .map((letter, index) => (Object.values(correctMap).filter(Boolean).length > index ? letter : '_'))
    .join('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCorrectMap = {
      fullName: normalizeText(answers.fullName) === correctAnswers.fullName,
      school: normalizeText(answers.school) === correctAnswers.school,
      neighbourhood: normalizeText(answers.neighbourhood).includes(correctAnswers.neighbourhood),
      routine: normalizeText(answers.routine).includes(correctAnswers.routine),
      workplace: normalizeText(answers.workplace) === correctAnswers.workplace
    };

    setCorrectMap(nextCorrectMap);

    const correctCount = Object.values(nextCorrectMap).filter(Boolean).length;

    if (correctCount === 5) {
      setFeedback('[ok] five details linked. footprint chain complete.');
      unlock();
      return;
    }

    setFeedback(`[err] ${correctCount}/5 clues matched. cross-check the public trail.`);
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// FOOTPRINT FINDER" accent="cyan" />
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-green">
            leak map: <span className="text-text-primary">{revealedWord}</span>
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Read across four public sources and piece together the five details the character leaked by mistake.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {clues.map((clue) => (
          <div key={clue.key} className={panelClassName}>
            <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">{clue.title}</p>
            <p className="mt-2 text-sm text-text-secondary">{clue.clue}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          {clues.map((clue) => (
            <label key={clue.key} className={panelClassName}>
              <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                {clue.title}
              </span>
              <input
                value={answers[clue.key]}
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, [clue.key]: event.target.value }))
                }
                className="terminal-input"
                placeholder="Type the detail you found"
              />
              {correctMap[clue.key] && (
                <p className="mt-2 font-display text-[10px] uppercase tracking-[0.12em] text-neon-green">
                  confirmed
                </p>
              )}
            </label>
          ))}
        </div>

        <button type="submit" className="btn-primary w-full">
          VERIFY FOOTPRINT
        </button>

        {feedback && (
          <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
            {feedback}
          </p>
        )}
      </form>
    </div>
  );
}

function PasswordVaultBreakInGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [password, setPassword] = useState('');
  const [vaultState, setVaultState] = useState<'sealed' | 'open' | 'wrong'>('sealed');

  const profile = [
    'First pet: Milo, a black cat who liked sleeping on keyboard cases.',
    'Started school in 2018 after moving to a new neighbourhood.',
    'Lucky number: 7, always picked for raffle tickets and game scores.',
    'The password pattern ends with an exclamation mark.'
  ];

  const expectedPassword = 'Milo20187!';

  const handleOpenVault = () => {
    if (password.trim() === expectedPassword) {
      setVaultState('open');
      unlock();
      return;
    }

    setVaultState('wrong');
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// PASSWORD VAULT BREAK-IN" accent="orange" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            policy lesson: avoid personal info in passwords
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Build the vault password from the profile clues and unlock the hidden compartment.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={panelClassName}>
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">Owner profile</p>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            {profile.map((item) => (
              <li key={item} className="rounded border border-border-dim bg-bg-surface px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`rounded border p-4 ${
            vaultState === 'open'
              ? 'border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.06)]'
              : 'border-border-dim bg-bg-surface-2'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-[11px] uppercase tracking-[0.12em] text-text-secondary">Vault door</p>
            <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-green">
              {vaultState === 'open' ? 'OPEN' : 'SEALED'}
            </p>
          </div>
          <div className="mt-4 rounded border border-border-dim bg-[linear-gradient(180deg,rgba(9,13,23,0.7),rgba(2,6,15,0.92))] p-5 text-center">
            <p className="font-display text-2xl tracking-[0.18em] text-text-primary">LOCK</p>
            <p className="mt-2 text-sm text-text-secondary">Try the password once you have all four pieces.</p>
          </div>
          {vaultState === 'open' && (
            <p className="mt-3 rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
              [ok] vault opened and flag extracted
            </p>
          )}
          {vaultState === 'wrong' && (
            <p className="mt-3 rounded border border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-alert-orange">
              [err] incorrect password format
            </p>
          )}
        </div>
      </div>

      <div className={panelClassName}>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          Vault password
        </label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="terminal-input"
          placeholder="Combine the clues into one password"
        />
        <button type="button" onClick={handleOpenVault} className="btn-primary mt-3 w-full">
          OPEN VAULT
        </button>
      </div>
    </div>
  );
}

function SpotThePhishSpeedRoundGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const messages: PhishMessage[] = [
    {
      id: 'msg-1',
      sender: 'it-support@contendly.edu',
      channel: 'email',
      subject: 'Scheduled password check',
      body: 'Please visit the staff portal from your bookmarks to confirm you changed your password this term.',
      verdict: 'safe',
      explanation: 'The sender matches the institution and does not pressure you into clicking an unknown link.'
    },
    {
      id: 'msg-2',
      sender: 'security-team@contendly.edu',
      channel: 'email',
      subject: 'Unusual login alert',
      body: 'We noticed a login from a new device. Open the portal via the saved bookmark, not the link below.',
      verdict: 'safe',
      explanation: 'It warns you about an event, but the instruction points to a known safe route instead of a random link.'
    },
    {
      id: 'msg-3',
      sender: 'bank-alerts@secure-check.pro',
      channel: 'sms',
      subject: 'Account blocked',
      body: 'Your account will be locked in 10 minutes. Reply with your card number now to prevent suspension.',
      verdict: 'phish',
      explanation: 'Urgency plus a request for sensitive information is a classic phish combination.'
    },
    {
      id: 'msg-4',
      sender: 'schoolbus@ride-update.com',
      channel: 'sms',
      subject: 'Route change',
      body: 'Tap here to confirm your pickup details: ride-update.com/confirm-now',
      verdict: 'phish',
      explanation: 'The shortened urgency-heavy link and unrelated domain are red flags.'
    },
    {
      id: 'msg-5',
      sender: 'library@contendly.edu',
      channel: 'email',
      subject: 'Overdue reminder',
      body: 'Your book is due Friday. If you need help, reply through the library portal.',
      verdict: 'safe',
      explanation: 'No pressure, no attachment, and the contact path stays on an official portal.'
    },
    {
      id: 'msg-6',
      sender: 'helpdesk@contendly.edu',
      channel: 'email',
      subject: 'Temporary verification',
      body: 'We need to verify your password by email before 5 pm. Send the code from the login screen.',
      verdict: 'phish',
      explanation: 'Real support teams never ask you to send verification codes over email.'
    },
    {
      id: 'msg-7',
      sender: 'coach@contendly.edu',
      channel: 'sms',
      subject: 'Training time',
      body: 'See you at training after class. Bring your kit and water bottle as usual.',
      verdict: 'safe',
      explanation: 'A normal familiar message with no payment link, attachment, or urgency trap.'
    },
    {
      id: 'msg-8',
      sender: 'parcel-tracker@delivry-fast.co',
      channel: 'sms',
      subject: 'Package failure',
      body: 'Delivery failed twice. Verify your address immediately at tinyurl.example and pay the reschedule fee.',
      verdict: 'phish',
      explanation: 'Misspelled domain, urgency, and a payment prompt are all strong phish indicators.'
    }
  ];

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(6);
  const [feedback, setFeedback] = useState('');
  const [reviewLine, setReviewLine] = useState('');
  const [result, setResult] = useState<'running' | 'victory' | 'fail'>('running');
  const [isResolving, setIsResolving] = useState(false);
  const countdownRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const resolvedRef = useRef(false);
  const currentRef = useRef<PhishMessage | undefined>(undefined);
  const scoreRef = useRef(0);
  const indexRef = useRef(0);
  const resultRef = useRef<'running' | 'victory' | 'fail'>('running');

  const current = messages[index];

  useEffect(() => {
    currentRef.current = current;
    scoreRef.current = score;
    indexRef.current = index;
    resultRef.current = result;
  }, [current, score, index, result]);

  const handleResponse = useCallback(
    (choice: 'safe' | 'phish' | 'timeout') => {
      const active = currentRef.current;

      if (!active || resolvedRef.current || resultRef.current !== 'running') {
        return;
      }

      resolvedRef.current = true;
      setIsResolving(true);

      if (countdownRef.current !== null) {
        window.clearInterval(countdownRef.current);
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      const isCorrect = choice === active.verdict;
      const nextScore = scoreRef.current + (isCorrect ? 1 : 0);

      setFeedback(
        choice === 'timeout'
          ? `[err] timer expired. ${active.explanation}`
          : isCorrect
            ? `[ok] correct. ${active.explanation}`
            : `[err] wrong call. ${active.explanation}`
      );
      setScore(nextScore);
      setReviewLine(
        choice === 'timeout'
          ? 'No answer before the timer ran out.'
          : `${choice.toUpperCase()} selected for ${active.sender}.`
      );

      window.setTimeout(() => {
        if (indexRef.current === 7) {
          const didWin = nextScore >= 7;
          setResult(didWin ? 'victory' : 'fail');
          if (didWin) {
            unlock();
          }
          setIsResolving(false);
          return;
        }

        setIndex((previous) => previous + 1);
        setIsResolving(false);
      }, 900);
    },
    [unlock]
  );

  useEffect(() => {
    if (result !== 'running' || !current) {
      return;
    }

    resolvedRef.current = false;
    setSecondsLeft(6);
    setFeedback('');
    setReviewLine('');
    setIsResolving(false);

    const startedAt = Date.now();

    countdownRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      setSecondsLeft(Math.max(0, 6 - elapsedSeconds));
    }, 200);

    timeoutRef.current = window.setTimeout(() => {
      handleResponse('timeout');
    }, 6000);

    return () => {
      if (countdownRef.current !== null) {
        window.clearInterval(countdownRef.current);
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [current, result, handleResponse]);

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// SPOT THE PHISH SPEED ROUND" accent="orange" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            score {score}/8
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Classify each email or text before the timer runs out. You need 7 correct to unlock the flag.
        </p>
      </div>

      {result === 'running' && current && (
        <div className="space-y-3">
          <div className="rounded border border-border-dim bg-bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">
                {current.channel === 'sms' ? 'text message' : 'email'} {index + 1}/8
              </p>
              <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-green">
                {secondsLeft}s left
              </p>
            </div>
            <div className="mt-3 rounded border border-border-dim bg-bg-surface-2 p-4">
              <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
                from {current.sender}
              </p>
              <p className="mt-2 font-display text-[14px] text-text-primary">{current.subject}</p>
              <p className="mt-3 text-sm text-text-secondary">{current.body}</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleResponse('safe')}
                disabled={isResolving}
                className="btn-secondary"
              >
                SAFE
              </button>
              <button
                type="button"
                onClick={() => handleResponse('phish')}
                disabled={isResolving}
                className="btn-primary"
              >
                PHISH
              </button>
            </div>
          </div>

          {feedback && (
            <div className="rounded border border-[rgba(255,107,53,0.35)] bg-[rgba(255,107,53,0.08)] p-4">
              <p className="font-display text-[11px] uppercase tracking-[0.12em] text-alert-orange">
                {feedback}
              </p>
              {reviewLine && <p className="mt-2 text-sm text-text-secondary">{reviewLine}</p>}
            </div>
          )}
        </div>
      )}

      {result !== 'running' && (
        <div
          className={`rounded border p-5 ${
            result === 'victory'
              ? 'border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.08)]'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.08)]'
          }`}
        >
          <p
            className={`font-display text-[12px] uppercase tracking-[0.14em] ${
              result === 'victory' ? 'text-neon-green' : 'text-alert-orange'
            }`}
          >
            {result === 'victory' ? 'mission cleared' : 'mission failed'}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {result === 'victory'
              ? 'Seven or more correct calls beat the inbox flood.'
              : 'You missed the threshold. Re-run the round and watch the red flags more closely.'}
          </p>
        </div>
      )}
    </div>
  );
}

function TwoFaTowerDefenseGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [placements, setPlacements] = useState<Record<string, string>>({
    'gate-a': '',
    'gate-b': '',
    'gate-c': ''
  });
  const [mode, setMode] = useState<'idle' | 'running' | 'victory' | 'fail'>('idle');
  const [waveIndex, setWaveIndex] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (mode !== 'running') {
      return;
    }

    if (waveIndex >= TWO_FA_WAVES.length) {
      const success = TWO_FA_CHECKPOINTS.every((checkpoint) => placements[checkpoint.id] === checkpoint.requiredTower);
      setMode(success ? 'victory' : 'fail');
      if (success) {
        unlock();
      }
      return;
    }

    const wave = TWO_FA_WAVES[waveIndex];

    const timer = window.setTimeout(() => {
      const attackRequirement = TWO_FA_ATTACK_REQUIREMENTS[wave];
      const checkpointId = TWO_FA_CHECKPOINTS.find((item) => item.requiredTower === attackRequirement)?.id;
      const isBlocked = checkpointId ? placements[checkpointId] === attackRequirement : false;

      if (!isBlocked) {
        setLog((previous) => [...previous, `[breach] ${wave} slipped past the defenses.`]);
        setMode('fail');
        return;
      }

      setLog((previous) => [...previous, `[ok] ${wave} blocked at ${checkpointId}.`]);
      setWaveIndex((previous) => previous + 1);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mode, waveIndex, placements, unlock]);

  const startDefense = () => {
    const placementsReady = TWO_FA_CHECKPOINTS.every((checkpoint) => placements[checkpoint.id] === checkpoint.requiredTower);

    if (!placementsReady) {
      setLog(['[err] towers must be placed at the correct checkpoints before deployment.']);
      setMode('fail');
      return;
    }

    setLog(['[ok] defense grid armed. attackers inbound.']);
    setWaveIndex(0);
    setMode('running');
  };

  const restartDefense = () => {
    setMode('idle');
    setWaveIndex(0);
    setLog([]);
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// 2FA TOWER DEFENCE" accent="green" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            defend 10 attack waves
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Place each defense at the right checkpoint before the attackers reach the protected account.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={panelClassName}>
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">Path map</p>
          <div className="mt-3 space-y-3">
            {TWO_FA_CHECKPOINTS.map((checkpoint, index) => (
              <div key={checkpoint.id} className="rounded border border-border-dim bg-bg-primary p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
                    {checkpoint.label}
                  </p>
                  <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-green">
                    wave block {index + 1}
                  </p>
                </div>
                <select
                  value={placements[checkpoint.id]}
                  onChange={(event) =>
                    setPlacements((previous) => ({ ...previous, [checkpoint.id]: event.target.value }))
                  }
                  className="terminal-input mt-3"
                  disabled={mode === 'running'}
                >
                  <option value="">Select tower</option>
                  {TWO_FA_TOWER_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className={panelClassName}>
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">Wave feed</p>
          <div className="mt-3 rounded border border-border-dim bg-bg-primary p-4">
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              current wave
            </p>
            <p className="mt-2 font-display text-[20px] text-text-primary">
              {mode === 'running'
                ? `${waveIndex + 1}/${TWO_FA_WAVES.length} - ${TWO_FA_WAVES[waveIndex]}`
                : mode === 'victory'
                  ? 'all waves blocked'
                  : mode === 'fail'
                    ? 'breach detected'
                    : 'stand by'}
            </p>
            <div className="mt-4 grid gap-2">
              {TWO_FA_WAVES.map((wave, index) => (
                <div
                  key={`${wave}-${index}`}
                  className={`rounded border px-3 py-2 font-display text-[10px] uppercase tracking-[0.12em] ${
                    index < waveIndex
                      ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
                      : index === waveIndex && mode === 'running'
                        ? 'border-[rgba(0,229,255,0.35)] bg-[rgba(0,229,255,0.08)] text-neon-cyan'
                        : 'border-border-dim bg-bg-surface-2 text-text-secondary'
                  }`}
                >
                  wave {index + 1}: {wave}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={startDefense} className="btn-primary flex-1" disabled={mode === 'running'}>
              DEPLOY TOWERS
            </button>
            <button type="button" onClick={restartDefense} className="btn-ghost">
              RESET
            </button>
          </div>
        </div>
      </div>

      {log.length > 0 && (
        <div className={panelClassName}>
          <p className="mb-2 flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.13em] text-neon-green">
            kid@defender:~$ tower-defense --watch
            <TerminalCursor className="h-[11px] w-[6px] bg-neon-green" />
          </p>
          <div className="space-y-1 font-mono text-xs text-text-secondary">
            {log.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </div>
      )}

      {mode === 'victory' && (
        <div className="rounded border border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.08)] p-5 text-center">
          <p className="font-display text-[12px] uppercase tracking-[0.16em] text-neon-green">
            mission complete
          </p>
          <p className="mt-2 text-sm text-text-secondary">The account stayed protected through all ten waves.</p>
        </div>
      )}

      {mode === 'fail' && (
        <div className="rounded border border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.08)] p-5 text-center">
          <p className="font-display text-[12px] uppercase tracking-[0.16em] text-alert-orange">
            defense breached
          </p>
          <p className="mt-2 text-sm text-text-secondary">Adjust the checkpoints and try again.</p>
        </div>
      )}
    </div>
  );
}

function PrivacySettingsEscapeRoomGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const settings = [
    {
      id: 'location',
      label: 'Location permissions',
      caseNote: 'The app needs to show a route, but only for the session you are using it.',
      targetState: 'limited' as PrivacyLevel
    },
    {
      id: 'microphone',
      label: 'Microphone access',
      caseNote: 'Voice input is a feature, but not something that should keep listening forever.',
      targetState: 'limited' as PrivacyLevel
    },
    {
      id: 'camera',
      label: 'Camera access',
      caseNote: 'The camera is only needed when someone is actively taking a photo.',
      targetState: 'limited' as PrivacyLevel
    },
    {
      id: 'contacts',
      label: 'Contacts sharing',
      caseNote: 'The app asks for the full address book during sign-up, but never uses contact sync.',
      targetState: 'off' as PrivacyLevel
    },
    {
      id: 'ad-tracking',
      label: 'Ad tracking',
      caseNote: 'The app says ads might be more relevant if tracking stays on.',
      targetState: 'off' as PrivacyLevel
    },
    {
      id: 'app-data',
      label: 'App data collection',
      caseNote: 'The app wants usage statistics plus a few optional diagnostics.',
      targetState: 'limited' as PrivacyLevel
    },
    {
      id: 'photo-library',
      label: 'Photo library access',
      caseNote: 'The app needs to attach one image, not browse the full camera roll.',
      targetState: 'limited' as PrivacyLevel
    },
    {
      id: 'bluetooth',
      label: 'Bluetooth scanning',
      caseNote: 'The app advertises nearby device discovery, but the feature is optional.',
      targetState: 'off' as PrivacyLevel
    },
    {
      id: 'location-history',
      label: 'Location history',
      caseNote: 'A travel recap would be nice, but the device would keep a trail over time.',
      targetState: 'off' as PrivacyLevel
    },
    {
      id: 'backup-sync',
      label: 'Cloud backup sync',
      caseNote: 'The app can restore data later if a backup is kept, but nothing should be overshared.',
      targetState: 'limited' as PrivacyLevel
    },
    {
      id: 'notifications',
      label: 'Lock-screen notifications',
      caseNote: 'Message previews would be visible to anyone glancing at the phone lock screen.',
      targetState: 'off' as PrivacyLevel
    },
    {
      id: 'clipboard',
      label: 'Clipboard access',
      caseNote: 'The app wants to read whatever was just copied, even when you are switching tasks.',
      targetState: 'limited' as PrivacyLevel
    }
  ] as const;

  const [secureState, setSecureState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(settings.map((setting) => [setting.id, false])) as Record<string, boolean>
  );
  const [feedback, setFeedback] = useState('');
  const [selectionState, setSelectionState] = useState<Record<string, PrivacyLevel>>(
    () => Object.fromEntries(settings.map((setting) => [setting.id, 'allowed'])) as Record<string, PrivacyLevel>
  );
  const [reviewResults, setReviewResults] = useState<Record<string, boolean> | null>(null);

  const correctCount = settings.filter((setting) => secureState[setting.id]).length;

  const setSettingState = (settingId: string, level: PrivacyLevel) => {
    setSelectionState((previous) => ({ ...previous, [settingId]: level }));
    setReviewResults(null);
    setFeedback('');

    const setting = settings.find((item) => item.id === settingId);
    const isCorrect = setting ? level === setting.targetState : false;

    setSecureState((previous) => {
      return { ...previous, [settingId]: isCorrect };
    });
  };

  const handleCheck = () => {
    const results = Object.fromEntries(
      settings.map((setting) => [setting.id, selectionState[setting.id] === setting.targetState])
    ) as Record<string, boolean>;

    setSecureState(results);
    setReviewResults(results);

    const solvedCount = Object.values(results).filter(Boolean).length;

    if (solvedCount === settings.length) {
      setFeedback('[ok] all privacy leaks sealed. flag recovered.');
      unlock();
      return;
    }

    setFeedback(`[err] ${solvedCount}/12 settings are secure. adjust the rest and check again.`);
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// PRIVACY SETTINGS ESCAPE ROOM" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            {reviewResults ? `checked ${correctCount}/12` : 'review pending'}
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Each setting needs the right privacy mode, not just the most restrictive one. Use the brief and the case note to choose carefully.
        </p>
      </div>

      <div className={panelClassName}>
        <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">Privacy brief</p>
        <div className="mt-3 grid gap-2 text-sm text-text-secondary md:grid-cols-3">
          <div className="rounded border border-border-dim bg-bg-primary p-3">
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-green">Allowed</p>
            <p className="mt-1">Only for features that must stay fully open to work continuously.</p>
          </div>
          <div className="rounded border border-border-dim bg-bg-primary p-3">
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-green">Limited</p>
            <p className="mt-1">Use when a feature needs access, but only in the moment or with a narrow scope.</p>
          </div>
          <div className="rounded border border-border-dim bg-bg-primary p-3">
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-green">Off</p>
            <p className="mt-1">Choose this when the feature does not truly need the permission at all.</p>
          </div>
        </div>
      </div>

      <div className={panelClassName}>
        <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-green">
          flag build: <span className="text-text-primary">{reviewResults && correctCount === settings.length ? challengeFlag : 'LOCKED'}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-primary">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#00e5ff,#00ff88)] transition-all duration-300"
            style={{ width: reviewResults ? `${(correctCount / settings.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {settings.map((setting) => {
          const isSecure = secureState[setting.id];

          return (
            <div
              key={setting.id}
              className={`rounded border p-4 ${
                reviewResults
                  ? isSecure
                    ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.06)]'
                    : 'border-[rgba(255,107,53,0.35)] bg-[rgba(255,107,53,0.06)]'
                  : 'border-border-dim bg-bg-surface-2'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[11px] uppercase tracking-[0.12em] text-text-primary">
                  {setting.label}
                </p>
                {reviewResults && (
                  <p
                    className={`font-display text-[10px] uppercase tracking-[0.12em] ${
                      isSecure ? 'text-neon-green' : 'text-alert-orange'
                    }`}
                  >
                    {isSecure ? 'secure' : 'misconfigured'}
                  </p>
                )}
              </div>
              <p className="mt-2 text-sm text-text-secondary">{setting.caseNote}</p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['allowed', 'limited', 'off'] as PrivacyLevel[]).map((level) => {
                  const active = selectionState[setting.id] === level;

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSettingState(setting.id, level)}
                      className={`rounded border px-2 py-2 font-display text-[10px] uppercase tracking-[0.12em] transition-colors ${
                        active
                          ? 'border-neon-green bg-[rgba(0,255,136,0.12)] text-neon-green'
                          : 'border-border-dim bg-bg-primary text-text-secondary hover:border-border-bright hover:text-text-primary'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-xs text-text-secondary">
                {reviewResults ? (
                  <>
                    Session lock: {selectionState[setting.id] === setting.targetState ? 'aligned' : 'still exposed'}
                  </>
                ) : (
                  'Session lock: hidden until check'
                )}
              </p>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={handleCheck} className="btn-primary w-full">
        CHECK PRIVACY LOCKDOWN
      </button>

      {feedback && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          {feedback}
        </p>
      )}
    </div>
  );
}

function SocialEngineersTrapBossGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const tactics: BossTactic[] = useMemo(
    () =>
      shuffleList([
    {
      id: 'false-trust',
      label: 'False trust',
      excerpt: 'Hey, I go to your school too. You can trust me - I just need a quick favor.'
    },
    {
      id: 'urgency',
      label: 'Urgency',
      excerpt: 'Reply in the next 2 minutes or the account gets deleted forever.'
    },
    {
      id: 'authority',
      label: 'Appealing to authority',
      excerpt: 'This is the official support desk. I need your code to finish the security check.'
    },
    {
      id: 'incremental-disclosure',
      label: 'Incremental disclosure',
      excerpt: 'Just tell me your first name first, then we will confirm the rest later.'
    },
    {
      id: 'isolation',
      label: 'Isolation',
      excerpt: 'Do not tell your parent or teacher, or they will make everything worse.'
    }
      ]),
    []
  );

  const [answers, setAnswers] = useState<Record<string, string>>(
    () =>
      tactics.reduce<Record<string, string>>((acc, tactic) => {
        acc[tactic.id] = '';
        return acc;
      }, {})
  );
  const [selectedResponse, setSelectedResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [missionState, setMissionState] = useState<'active' | 'success' | 'error'>('active');
  const tacticOptions = useMemo(
    () =>
      shuffleList([
        'False trust',
        'Urgency',
        'Appealing to authority',
        'Incremental disclosure',
        'Isolation'
      ]),
    []
  );
  const responseOptions = useMemo(
    () =>
      shuffleList([
        'I am not sharing any codes. I will tell a trusted adult and block this chat.',
        'I can help if you prove who you are first.',
        'Maybe I can answer later after I think about it.',
        'Please stop messaging me for now.'
      ]),
    []
  );

  const chatLog = [
    { speaker: 'Stranger', text: 'You seem smart. I think you can help me with a small school project.' },
    { speaker: 'Child', text: 'Okay, maybe...' },
    { speaker: 'Stranger', text: 'It has to be done right now so nobody else notices.' },
    { speaker: 'Child', text: 'Why the rush?' },
    { speaker: 'Stranger', text: 'I work with support. Just send the code that was texted to you.' },
    { speaker: 'Child', text: 'That feels odd.' },
    { speaker: 'Stranger', text: 'Do not tell an adult, or they will ruin the chance to fix it.' }
  ];

  const handleSubmit = () => {
    const tacticResults = tactics.map((tactic) => {
      return answers[tactic.id] === tactic.label;
    });

    const responseMatch = selectedResponse === 'I am not sharing any codes. I will tell a trusted adult and block this chat.';

    if (tacticResults.every(Boolean) && responseMatch) {
      setMissionState('success');
      setFeedback('[ok] all tactics identified. mission complete.');
      unlock();
      return;
    }

    setMissionState('error');
    setFeedback('[err] one or more tactics are still misidentified.');
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// THE SOCIAL ENGINEER'S TRAP" accent="orange" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">boss challenge</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Read the chat, name all five tactics, and choose the safe response at the critical moment.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className={panelClassName}>
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">Chat transcript</p>
          <div className="mt-3 space-y-3">
            {chatLog.map((entry) => (
              <div
                key={`${entry.speaker}-${entry.text}`}
                className={`rounded border px-3 py-2 ${
                  entry.speaker === 'Stranger'
                    ? 'border-[rgba(255,107,53,0.35)] bg-[rgba(255,107,53,0.08)]'
                    : 'border-border-dim bg-bg-surface-2'
                }`}
              >
                <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
                  {entry.speaker}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={panelClassName}>
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">Tactic analysis</p>
          <div className="mt-3 space-y-3">
            {tactics.map((tactic) => (
              <div key={tactic.id} className="rounded border border-border-dim bg-bg-primary p-3">
                <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-green">
                  {tactic.excerpt}
                </p>
                <div className="mt-3 grid gap-2">
                  <select
                    value={answers[tactic.id]}
                    onChange={(event) =>
                      setAnswers((previous) => ({
                        ...previous,
                        [tactic.id]: event.target.value
                      }))
                    }
                    className="terminal-input"
                  >
                    <option value="">Select tactic</option>
                    {tacticOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={panelClassName}>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          Safe response
        </label>
        <select
          value={selectedResponse}
          onChange={(event) => setSelectedResponse(event.target.value)}
          className="terminal-input"
        >
          <option value="">Choose the safest response</option>
          {responseOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <button type="button" onClick={handleSubmit} className="btn-primary w-full">
        SUBMIT ANALYSIS
      </button>

      {feedback && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            missionState === 'success'
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {feedback}
        </p>
      )}

      {missionState === 'success' && (
        <div className="rounded border border-[rgba(0,255,136,0.45)] bg-[linear-gradient(180deg,rgba(0,255,136,0.12),rgba(0,229,255,0.06))] p-5 text-center">
          <p className="font-display text-[12px] uppercase tracking-[0.16em] text-neon-green">
            mission complete
          </p>
          <p className="mt-2 text-sm text-text-secondary">You spotted the manipulation before the attacker could escalate.</p>
        </div>
      )}
    </div>
  );
}

export function Week2ActivityExperience({
  activityId,
  challengeFlag,
  onFlagDiscovered
}: Week2ActivityExperienceProps) {
  const renderChallenge = () => {
    if (activityId === 'footprint-finder') {
      return <FootprintFinderGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'password-vault-break-in') {
      return <PasswordVaultBreakInGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'spot-the-phish-speed-round') {
      return <SpotThePhishSpeedRoundGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === '2fa-tower-defence') {
      return <TwoFaTowerDefenseGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'privacy-settings-escape-room') {
      return <PrivacySettingsEscapeRoomGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'social-engineers-trap') {
      return <SocialEngineersTrapBossGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    return <Week2MissionUnavailable activityId={activityId} />;
  };

  return <Week2ChallengeShell>{renderChallenge()}</Week2ChallengeShell>;
}
