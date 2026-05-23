'use client';

import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { SectionLabel } from '@/components/shared/SectionLabel';

interface NewActivitiesExperienceProps {
  activityId: string;
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

interface GameProps {
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

const panelClassName = 'rounded border border-border-dim bg-bg-surface-2 p-4';

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

function ActivityShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="rounded border border-[rgba(0,229,255,0.24)] bg-[linear-gradient(160deg,rgba(8,12,26,0.96),rgba(14,21,39,0.94))] p-4 shadow-panel-soft">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label={title} accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            beginner cyber lab
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

function EndStars({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className={`text-2xl ${index < count ? 'text-[#ffe680]' : 'text-text-dim'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function CompletionCard({
  title,
  subtitle,
  stars,
  onReplay,
  replayLabel = 'Replay Activity'
}: {
  title: string;
  subtitle: string;
  stars: number;
  onReplay: () => void;
  replayLabel?: string;
}) {
  return (
    <div className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] p-5 text-center">
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">Mission Complete</p>
      <h3 className="mt-2 font-display text-2xl text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
      <div className="mt-4">
        <EndStars count={stars} />
      </div>
      <button type="button" onClick={onReplay} className="btn-secondary mt-5">
        {replayLabel}
      </button>
    </div>
  );
}

function PasswordBuilderGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const weakPassword = 'coco2013';
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const stars = attempts <= 1 ? 3 : attempts <= 3 ? 2 : 1;

  const checkGuess = () => {
    const normalized = guess.trim().toLowerCase();

    if (!normalized) {
      setFeedback('Type a password guess first.');
      return;
    }

    setAttempts((previous) => previous + 1);

    if (normalized === weakPassword) {
      setFeedback('[ok] Good job. You found the weak password.');
      setIsComplete(true);
      unlock();
      return;
    }

    setFeedback('Not yet. Try pet name + birth year.');
  };

  const restart = () => {
    setGuess('');
    setAttempts(0);
    setFeedback('');
    setIsComplete(false);
  };

  return (
    <ActivityShell title="// PASSWORD BUILDER">
      {!isComplete ? (
        <div className="space-y-4">
          <div className={panelClassName}>
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-cyan">Profile Clues</p>
            <ul className="mt-3 space-y-2 text-sm text-text-primary">
              <li>Character name: Lila Stone</li>
              <li>Pet name: Coco</li>
              <li>Birth year: 2013</li>
              <li>Favorite game: Sky Runner</li>
            </ul>
            <p className="mt-3 text-sm text-text-secondary">
              Guess the weak password this person might use.
            </p>
          </div>

          <div className={panelClassName}>
            <label className="block font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
              Password Guess
            </label>
            <input
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              className="terminal-input mt-2"
              placeholder="Type your guess"
            />
            <button type="button" onClick={checkGuess} className="btn-primary mt-3 w-full">
              Check Guess
            </button>
            {feedback && <p className="mt-3 text-sm text-text-secondary">{feedback}</p>}
          </div>
        </div>
      ) : (
        <CompletionCard
          title="Weak Password Found"
          subtitle="Now you know why simple passwords are risky."
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

interface FootprintItem {
  id: string;
  label: string;
  value: string;
  isSensitive: boolean;
}

function FootprintInvestigatorGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const profileItems: FootprintItem[] = [
    { id: 'name', label: 'Full name', value: 'Tobi Adebayo', isSensitive: true },
    { id: 'school', label: 'School', value: 'Green Valley Junior School', isSensitive: true },
    { id: 'birthday', label: 'Birthday', value: '12 May 2012', isSensitive: true },
    { id: 'phone', label: 'Phone number', value: '+234 800 123 4567', isSensitive: true },
    { id: 'street', label: 'Home street', value: '14 Palm Street', isSensitive: true },
    { id: 'pet', label: 'Pet name', value: 'Cookie', isSensitive: false },
    { id: 'favorite-color', label: 'Favorite color', value: 'Blue', isSensitive: false },
    { id: 'daily-route', label: 'Daily route', value: 'Bus 7 to school every morning', isSensitive: true }
  ];

  const sensitiveIds = profileItems.filter((item) => item.isSensitive).map((item) => item.id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

  const toggleItem = (itemId: string) => {
    setSelectedIds((previous) =>
      previous.includes(itemId) ? previous.filter((id) => id !== itemId) : [...previous, itemId]
    );
  };

  const checkAnswer = () => {
    const selected = new Set(selectedIds);
    const sensitive = new Set(sensitiveIds);

    const isExactMatch =
      selected.size === sensitive.size && sensitiveIds.every((sensitiveId) => selected.has(sensitiveId));

    if (isExactMatch) {
      setFeedback('[ok] Great job. You found all exposed personal data.');
      setIsComplete(true);
      unlock();
      return;
    }

    const correctCount = sensitiveIds.filter((id) => selected.has(id)).length;
    setMistakes((previous) => previous + 1);
    setFeedback(`You found ${correctCount} of ${sensitiveIds.length}. Keep checking the profile.`);
  };

  const restart = () => {
    setSelectedIds([]);
    setFeedback('');
    setMistakes(0);
    setIsComplete(false);
  };

  return (
    <ActivityShell title="// FOOTPRINT INVESTIGATOR">
      {!isComplete ? (
        <div className="space-y-4">
          <div className={panelClassName}>
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-cyan">Task</p>
            <p className="mt-2 text-sm text-text-secondary">
              Tap every item that shares too much personal data.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {profileItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`rounded border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-alert-orange bg-[rgba(255,107,53,0.12)] text-alert-orange'
                      : 'border-border-dim bg-bg-surface text-text-primary hover:border-border-bright'
                  }`}
                >
                  <p className="font-display text-[10px] uppercase tracking-[0.12em]">{item.label}</p>
                  <p className="mt-2 text-sm">{item.value}</p>
                </button>
              );
            })}
          </div>

          <button type="button" onClick={checkAnswer} className="btn-primary w-full">
            Check My Picks
          </button>

          {feedback && <p className="text-sm text-text-secondary">{feedback}</p>}
        </div>
      ) : (
        <CompletionCard
          title="Footprint Checked"
          subtitle="You spotted personal data that should stay private."
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

function getPasswordChecks(password: string) {
  const checks = {
    longEnough: password.length >= 12,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbolOrSpace: /[^A-Za-z0-9]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length * 20;

  let label = 'Weak';
  if (score >= 80) {
    label = 'Very Strong';
  } else if (score >= 60) {
    label = 'Strong';
  } else if (score >= 40) {
    label = 'Okay';
  }

  return { checks, score, label };
}

function BuildStrongestPasswordGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const analysis = useMemo(() => getPasswordChecks(password), [password]);
  const stars = analysis.score === 100 ? 3 : analysis.score >= 80 ? 2 : 1;

  const lockPassword = () => {
    if (analysis.label !== 'Very Strong') {
      setFeedback('Keep going. Try 3+ words, numbers, and a symbol.');
      return;
    }

    setFeedback('[ok] Very Strong! Great password work.');
    setIsComplete(true);
    unlock();
  };

  const restart = () => {
    setPassword('');
    setFeedback('');
    setIsComplete(false);
  };

  return (
    <ActivityShell title="// BUILD THE STRONGEST PASSWORD">
      {!isComplete ? (
        <div className="space-y-4">
          <div className={panelClassName}>
            <p className="text-sm text-text-secondary">
              Build a passphrase that reaches <span className="text-neon-green">Very Strong</span>.
            </p>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="terminal-input mt-3"
              placeholder="Example: BlueTiger!Run2026"
            />
          </div>

          <div className={panelClassName}>
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-cyan">Strength Meter</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border-dim">
              <div className="h-full bg-neon-green transition-all" style={{ width: `${analysis.score}%` }} />
            </div>
            <p className="mt-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
              {analysis.label} ({analysis.score}/100)
            </p>

            <div className="mt-3 grid gap-2 text-sm text-text-secondary md:grid-cols-2">
              <p>{analysis.checks.longEnough ? '✅' : '⬜'} 12+ characters</p>
              <p>{analysis.checks.hasUpper ? '✅' : '⬜'} has uppercase letter</p>
              <p>{analysis.checks.hasLower ? '✅' : '⬜'} has lowercase letter</p>
              <p>{analysis.checks.hasNumber ? '✅' : '⬜'} has a number</p>
              <p>{analysis.checks.hasSymbolOrSpace ? '✅' : '⬜'} has symbol or space</p>
            </div>
          </div>

          <button type="button" onClick={lockPassword} className="btn-primary w-full">
            Check Password
          </button>

          {feedback && <p className="text-sm text-text-secondary">{feedback}</p>}
        </div>
      ) : (
        <CompletionCard
          title="Very Strong Password"
          subtitle="Nice work. Your passphrase is strong and safer."
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

function CipherGame({
  title,
  instructions,
  words,
  expected,
  letterMode,
  challengeFlag,
  onFlagDiscovered
}: {
  title: string;
  instructions: string;
  words: string[];
  expected: string;
  letterMode: 'first' | 'second';
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const hintLetters = words
    .map((word) => {
      if (letterMode === 'first') {
        return word[0] ?? '';
      }

      return word[1] ?? '';
    })
    .join('')
    .toUpperCase();

  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

  const checkAnswer = () => {
    if (answer.trim().toUpperCase() === expected) {
      setFeedback('[ok] Correct. You cracked the code.');
      setIsComplete(true);
      unlock();
      return;
    }

    setMistakes((previous) => previous + 1);
    setFeedback('Not correct yet. Try reading the letters again.');
  };

  const restart = () => {
    setAnswer('');
    setShowHint(false);
    setFeedback('');
    setMistakes(0);
    setIsComplete(false);
  };

  return (
    <ActivityShell title={title}>
      {!isComplete ? (
        <div className="space-y-4">
          <div className={panelClassName}>
            <p className="text-sm text-text-secondary">{instructions}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {words.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="rounded border border-border-bright bg-bg-surface px-2 py-1 text-sm text-text-primary"
                >
                  {index + 1}. {word}
                </span>
              ))}
            </div>
          </div>

          <div className={panelClassName}>
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="terminal-input"
              placeholder="Type hidden code"
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={checkAnswer} className="btn-primary w-full">
                Check Code
              </button>
              <button type="button" onClick={() => setShowHint((previous) => !previous)} className="btn-ghost w-full">
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>
            {showHint && (
              <p className="mt-3 text-sm text-text-secondary">
                Hint letters: <span className="text-neon-cyan">{hintLetters}</span>
              </p>
            )}
            {feedback && <p className="mt-3 text-sm text-text-secondary">{feedback}</p>}
          </div>
        </div>
      ) : (
        <CompletionCard
          title="Cipher Solved"
          subtitle="Great reading and pattern skills."
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

function SpyMessageRelayGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const words = [
    'Brave',
    'kids',
    'always',
    'Smile',
    'when',
    'they',
    'browse',
    'Alert',
    'and',
    'never',
    'open',
    'Files',
    'from',
    'random',
    'links',
    'Ever'
  ];

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

  const check = () => {
    if (answer.trim().toUpperCase() === 'SAFE') {
      setFeedback('[ok] Mission code found.');
      setIsComplete(true);
      unlock();
      return;
    }

    setMistakes((previous) => previous + 1);
    setFeedback('Try again. Take every 4th word, then first letters.');
  };

  const restart = () => {
    setAnswer('');
    setFeedback('');
    setMistakes(0);
    setIsComplete(false);
  };

  return (
    <ActivityShell title="// SPY MESSAGE RELAY">
      {!isComplete ? (
        <div className="space-y-4">
          <div className={panelClassName}>
            <p className="text-sm text-text-secondary">
              Read the paragraph. Take every 4th word. Then use first letters to get the code.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {words.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className={`rounded border px-2 py-1 text-sm ${
                    (index + 1) % 4 === 0
                      ? 'border-neon-cyan/60 bg-neon-cyan-dim text-neon-cyan'
                      : 'border-border-dim bg-bg-surface text-text-primary'
                  }`}
                >
                  {index + 1}. {word}
                </span>
              ))}
            </div>
          </div>

          <div className={panelClassName}>
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="terminal-input"
              placeholder="Type code"
            />
            <button type="button" onClick={check} className="btn-primary mt-3 w-full">
              Check Code
            </button>
            {feedback && <p className="mt-3 text-sm text-text-secondary">{feedback}</p>}
          </div>
        </div>
      ) : (
        <CompletionCard
          title="Relay Complete"
          subtitle="Nice work. You followed the pattern correctly."
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

function SpotDeepfakeClueGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const stories = [
    {
      id: 'story-a',
      title: 'Photo News: Class Wins Inter-School Football Match',
      detail: 'The picture shows real jerseys, normal shadows, and the school field.'
    },
    {
      id: 'story-b',
      title: 'Photo News: Art Club Paints a Wall Mural',
      detail: 'The image has paint marks, brushes, and student names in the caption.'
    },
    {
      id: 'story-c',
      title: 'Photo News: Student Rides a Flying Shark to School Under 3 Suns',
      detail: 'The picture has extra fingers, weird shadows, and impossible sky lighting.'
    },
    {
      id: 'story-d',
      title: 'Photo News: School Garden Harvest Day',
      detail: 'The photo shows normal plants, tools, and students holding harvest baskets.'
    }
  ] as const;

  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const stars = mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;

  const checkAnswer = () => {
    if (!selectedStory) {
      setFeedback('Tap one picture news card first.');
      return;
    }

    const isCorrect = selectedStory === 'story-c';

    if (isCorrect) {
      setFeedback('[ok] Correct! This picture news is fake AI content.');
      setIsComplete(true);
      unlock();
      return;
    }

    setMistakes((previous) => previous + 1);
    setFeedback('Not yet. Look for impossible things in the picture.');
  };

  const restart = () => {
    setSelectedStory(null);
    setFeedback('');
    setMistakes(0);
    setIsComplete(false);
  };

  return (
    <ActivityShell title="// SPOT THE DEEPFAKE CLUE">
      {!isComplete ? (
        <div className="space-y-4">
          <div className={panelClassName}>
            <p className="text-sm text-text-secondary">
              Tap the fake AI picture news. Only one card is fake.
            </p>
            <p className="mt-2 text-xs text-text-secondary">Hint: the fake one looks impossible.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => setSelectedStory(story.id)}
                className={`rounded border p-4 text-left transition-all ${
                  selectedStory === story.id
                    ? 'border-neon-cyan bg-neon-cyan-dim text-neon-cyan'
                    : 'border-border-dim bg-bg-surface text-text-primary hover:border-border-bright'
                }`}
              >
                <p className="font-display text-[10px] uppercase tracking-[0.12em]">Picture News</p>
                <p className="mt-2 text-sm font-semibold">{story.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{story.detail}</p>
              </button>
            ))}
          </div>

          <button type="button" onClick={checkAnswer} className="btn-primary w-full">
            Check My Choice
          </button>

          {feedback && <p className="text-sm text-text-secondary">{feedback}</p>}
        </div>
      ) : (
        <CompletionCard
          title="Deepfake Clue Found"
          subtitle="Great job checking image clues before trusting the story."
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

interface AiScenario {
  id: string;
  text: string;
  side: 'defending' | 'attacking';
  explanation: string;
}

function AiDefenderOrAttackerGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const scenarios: AiScenario[] = [
    {
      id: 'ai-1',
      text: 'AI blocks spam emails before they reach students.',
      side: 'defending',
      explanation: 'Correct. It protects users from harmful messages.'
    },
    {
      id: 'ai-2',
      text: 'AI writes fake bank messages to trick people.',
      side: 'attacking',
      explanation: 'Correct. This is used to trick and steal information.'
    },
    {
      id: 'ai-3',
      text: 'AI watches login attempts and stops suspicious ones.',
      side: 'defending',
      explanation: 'Correct. It helps secure accounts.'
    },
    {
      id: 'ai-4',
      text: 'AI copies someone’s voice to ask for money.',
      side: 'attacking',
      explanation: 'Correct. It can be used for scams.'
    },
    {
      id: 'ai-5',
      text: 'AI finds malware files and removes them.',
      side: 'defending',
      explanation: 'Correct. This helps keep devices safe.'
    },
    {
      id: 'ai-6',
      text: 'AI creates fake websites that look real.',
      side: 'attacking',
      explanation: 'Correct. Fake sites are used for phishing.'
    },
    {
      id: 'ai-7',
      text: 'AI checks app code for security bugs.',
      side: 'defending',
      explanation: 'Correct. It helps teams fix weak spots.'
    },
    {
      id: 'ai-8',
      text: 'AI sends auto messages asking for your password.',
      side: 'attacking',
      explanation: 'Correct. Password stealing is an attack.'
    }
  ];

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<'defending' | 'attacking' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const current = scenarios[index];
  const stars = score >= 7 ? 3 : score >= 5 ? 2 : 1;

  const pickSide = (side: 'defending' | 'attacking') => {
    if (selected || isComplete) {
      return;
    }

    setSelected(side);

    const isCorrect = side === current.side;

    if (isCorrect) {
      setScore((previous) => previous + 1);
    }

    setFeedback(current.explanation);
  };

  const next = () => {
    if (!selected) {
      return;
    }

    if (index === scenarios.length - 1) {
      setIsComplete(true);
      unlock();
      return;
    }

    setIndex((previous) => previous + 1);
    setSelected(null);
    setFeedback('');
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback('');
    setIsComplete(false);
  };

  return (
    <ActivityShell title="// AI DEFENDER OR ATTACKER?">
      {!isComplete ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={panelClassName}>
              <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">Progress</p>
              <p className="mt-1 font-display text-lg text-neon-cyan">
                {index + 1}/{scenarios.length}
              </p>
            </div>
            <div className={panelClassName}>
              <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">Score</p>
              <p className="mt-1 font-display text-lg text-neon-green">{score}</p>
            </div>
          </div>

          <div className={panelClassName}>
            <p className="text-lg text-text-primary">{current.text}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => pickSide('defending')}
                disabled={Boolean(selected)}
                className="rounded border border-[rgba(0,255,136,0.4)] bg-neon-green-glow px-4 py-4 font-display text-base font-bold uppercase tracking-[0.08em] text-neon-green"
              >
                ✅ Defending
              </button>
              <button
                type="button"
                onClick={() => pickSide('attacking')}
                disabled={Boolean(selected)}
                className="rounded border border-[rgba(255,107,53,0.45)] bg-alert-orange-dim px-4 py-4 font-display text-base font-bold uppercase tracking-[0.08em] text-alert-orange"
              >
                ⚠️ Attacking
              </button>
            </div>
          </div>

          {feedback && (
            <div className={panelClassName}>
              <p className="text-sm text-text-secondary">{feedback}</p>
              <button type="button" onClick={next} className="btn-primary mt-3 w-full">
                {index === scenarios.length - 1 ? 'See Results' : 'Next'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <CompletionCard
          title="AI Sorting Complete"
          subtitle={`You scored ${score} out of ${scenarios.length}.`}
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

interface InboxEmail {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  isPhish: boolean;
}

function PhishingEmailHuntGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const emails: InboxEmail[] = [
    {
      id: 'mail-1',
      sender: 'school.office@greenvalley.edu',
      subject: 'Reminder: Parent meeting at 4 PM',
      preview: 'Please use the usual school portal for updates.',
      isPhish: false
    },
    {
      id: 'mail-2',
      sender: 'urgent-bank-alert@safe-banking-now.biz',
      subject: 'Your account will close in 1 hour',
      preview: 'Click this link now and confirm your password.',
      isPhish: true
    },
    {
      id: 'mail-3',
      sender: 'gaming-gift@freecoins-now.ru',
      subject: 'You won free coins',
      preview: 'Log in with your school email and password to claim.',
      isPhish: true
    },
    {
      id: 'mail-4',
      sender: 'library@citylibrary.org',
      subject: 'Book pickup is ready',
      preview: 'Your reserved book is ready at the front desk.',
      isPhish: false
    },
    {
      id: 'mail-5',
      sender: 'it-helpdesk@school-support.com',
      subject: 'Verify account now',
      preview: 'Reply with your password so we can fix your account.',
      isPhish: true
    },
    {
      id: 'mail-6',
      sender: 'coach@greenvalley.edu',
      subject: 'Training schedule update',
      preview: 'New training time is 3:30 PM in the sports hall.',
      isPhish: false
    },
    {
      id: 'mail-7',
      sender: 'security@schoolmail-protect.net',
      subject: 'Final warning: mailbox blocked',
      preview: 'Open attachment and enter login details.',
      isPhish: true
    }
  ];

  const phishingIds = emails.filter((email) => email.isPhish).map((email) => email.id);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

  const toggleFlag = (emailId: string) => {
    setFlaggedIds((previous) =>
      previous.includes(emailId) ? previous.filter((id) => id !== emailId) : [...previous, emailId]
    );
  };

  const checkFlags = () => {
    const selected = new Set(flaggedIds);
    const required = new Set(phishingIds);
    const isExactMatch =
      selected.size === required.size && phishingIds.every((phishId) => selected.has(phishId));

    if (isExactMatch) {
      setFeedback('[ok] Awesome. You flagged every phishing email.');
      setIsComplete(true);
      unlock();
      return;
    }

    const correctCount = phishingIds.filter((id) => selected.has(id)).length;
    setMistakes((previous) => previous + 1);
    setFeedback(`You found ${correctCount} of ${phishingIds.length} phishing emails. Keep checking sender and message style.`);
  };

  const restart = () => {
    setFlaggedIds([]);
    setFeedback('');
    setMistakes(0);
    setIsComplete(false);
  };

  return (
    <ActivityShell title="// THE PHISHING EMAIL HUNT">
      {!isComplete ? (
        <div className="space-y-4">
          <div className={panelClassName}>
            <p className="text-sm text-text-secondary">
              Tap emails that look like phishing. Then check your flags.
            </p>
            <p className="mt-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
              Flagged: {flaggedIds.length}
            </p>
          </div>

          <div className="space-y-3">
            {emails.map((email) => {
              const isFlagged = flaggedIds.includes(email.id);

              return (
                <button
                  key={email.id}
                  type="button"
                  onClick={() => toggleFlag(email.id)}
                  className={`w-full rounded border p-4 text-left transition-all ${
                    isFlagged
                      ? 'border-alert-orange bg-alert-orange-dim text-alert-orange'
                      : 'border-border-dim bg-bg-surface text-text-primary hover:border-border-bright'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-[10px] uppercase tracking-[0.12em]">{email.sender}</p>
                    <span className="font-display text-[10px] uppercase tracking-[0.12em]">
                      {isFlagged ? 'Flagged' : 'Tap to Flag'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{email.subject}</p>
                  <p className="mt-1 text-xs text-text-secondary">{email.preview}</p>
                </button>
              );
            })}
          </div>

          <button type="button" onClick={checkFlags} className="btn-primary w-full">
            Check Flags
          </button>

          {feedback && <p className="text-sm text-text-secondary">{feedback}</p>}
        </div>
      ) : (
        <CompletionCard
          title="Inbox Secured"
          subtitle="You protected the inbox by spotting phishing tricks."
          stars={stars}
          onReplay={restart}
        />
      )}
    </ActivityShell>
  );
}

function NewActivityUnavailable({ activityId }: { activityId: string }) {
  return (
    <div className={panelClassName}>
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-alert-orange">
        {'// SIMULATOR MODULE NOT LOADED'}
      </p>
      <p className="mt-2 text-sm text-text-secondary">No mapped game for {activityId}.</p>
    </div>
  );
}

export function NewActivitiesExperience({
  activityId,
  challengeFlag,
  onFlagDiscovered
}: NewActivitiesExperienceProps) {
  if (activityId === 'password-builder') {
    return <PasswordBuilderGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
  }

  if (activityId === 'footprint-investigator') {
    return <FootprintInvestigatorGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
  }

  if (activityId === 'build-strongest-password') {
    return <BuildStrongestPasswordGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
  }

  if (activityId === 'first-letter-cipher') {
    return (
      <CipherGame
        title="// FIRST LETTER CIPHER"
        instructions="Use the first letter of each word to find the hidden code."
        words={['Smart', 'Agents', 'Follow', 'Every', 'Tip', 'Yearly']}
        expected="SAFETY"
        letterMode="first"
        challengeFlag={challengeFlag}
        onFlagDiscovered={onFlagDiscovered}
      />
    );
  }

  if (activityId === 'second-letter-cipher') {
    return (
      <CipherGame
        title="// SECOND LETTER CIPHER"
        instructions="Use the second letter of each word to find the hidden code."
        words={['island', 'red', 'acorn', 'pupil', 'crowd', 'metal']}
        expected="SECURE"
        letterMode="second"
        challengeFlag={challengeFlag}
        onFlagDiscovered={onFlagDiscovered}
      />
    );
  }

  if (activityId === 'spy-message-relay') {
    return <SpyMessageRelayGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
  }

  if (activityId === 'spot-deepfake-clue') {
    return <SpotDeepfakeClueGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
  }

  if (activityId === 'ai-defender-or-attacker') {
    return <AiDefenderOrAttackerGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
  }

  if (activityId === 'phishing-email-hunt') {
    return <PhishingEmailHuntGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
  }

  return <NewActivityUnavailable activityId={activityId} />;
}
