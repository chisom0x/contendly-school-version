'use client';

import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { NewActivitiesExperience } from '@/components/activity/foundations/NewActivitiesExperience';

interface FoundationsActivityExperienceProps {
  activityId: string;
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

interface GameProps {
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

type MatchStatusTone = 'neutral' | 'success' | 'error';

const panelClassName = 'rounded border border-border-dim bg-bg-surface-2 p-4';

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

function CelebrationBurst({ trigger }: { trigger: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 16;
        const distance = 44 + ((index * 17 + trigger * 9) % 72);
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        const rotation = (index * 27 + trigger * 35) % 320;
        const delay = (index % 4) * 35;
        const colors = ['#00ff88', '#00e5ff', '#ff6b35', '#9cc7ff', '#ffe680'];

        return {
          id: `${trigger}-${index}`,
          dx,
          dy,
          rotation,
          delay,
          color: colors[index % colors.length]
        };
      }),
    [trigger]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => {
        const style = {
          left: '50%',
          top: '44%',
          backgroundColor: piece.color,
          '--confetti-dx': `${piece.dx.toFixed(0)}px`,
          '--confetti-dy': `${piece.dy.toFixed(0)}px`,
          '--confetti-rot': `${piece.rotation}deg`,
          animationDelay: `${piece.delay}ms`
        } as CSSProperties;

        return <span key={piece.id} className="confetti-piece" style={style} />;
      })}
    </div>
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

function ThreatOrNotGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const scenarios = [
    {
      id: 'stranger-link',
      icon: '🔗',
      text: 'Clicking a link from a stranger',
      safeAction: false,
      explanation: 'Unknown links can lead to fake websites or harmful downloads. Ask a trusted adult before opening it.'
    },
    {
      id: 'strong-password',
      icon: '🔒',
      text: 'Using a strong password',
      safeAction: true,
      explanation: 'Strong passwords are harder for attackers to guess. Mix letters, numbers, and symbols.'
    },
    {
      id: 'share-password',
      icon: '🤝',
      text: 'Sharing passwords with friends',
      safeAction: false,
      explanation: 'Passwords should stay private, even with friends. Shared passwords can spread fast and cause account problems.'
    },
    {
      id: 'app-update',
      icon: '📱',
      text: 'Updating your apps',
      safeAction: true,
      explanation: 'Updates often fix security bugs. Keeping apps updated helps protect your device.'
    },
    {
      id: 'random-download',
      icon: '⬇️',
      text: 'Downloading random files online',
      safeAction: false,
      explanation: 'Random downloads can hide malware. Only download from trusted websites.'
    },
    {
      id: 'logout-shared',
      icon: '🚪',
      text: 'Logging out on a shared computer',
      safeAction: true,
      explanation: 'Logging out protects your account from the next user. It is a smart and safe habit.'
    }
  ] as const;

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<'threat' | 'safe' | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [celebrateTick, setCelebrateTick] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentScenario = scenarios[scenarioIndex];
  const stars = score === scenarios.length ? 3 : score >= 4 ? 2 : 1;
  const badge =
    score === scenarios.length
      ? 'Badge: Threat Spotter Pro'
      : score >= 4
        ? 'Badge: Smart Defender'
        : 'Badge: Cyber Learner';

  const chooseAnswer = (choice: 'threat' | 'safe') => {
    if (selectedChoice || isComplete) {
      return;
    }

    const isCorrect = choice === (currentScenario.safeAction ? 'safe' : 'threat');
    setSelectedChoice(choice);
    setFeedback({
      correct: isCorrect,
      text: currentScenario.explanation
    });

    if (isCorrect) {
      setScore((previous) => previous + 1);
      setCelebrateTick((previous) => previous + 1);
    }
  };

  const goNext = () => {
    if (!selectedChoice) {
      return;
    }

    const isLastScenario = scenarioIndex === scenarios.length - 1;

    if (isLastScenario) {
      setIsComplete(true);
      unlock();
      return;
    }

    setScenarioIndex((previous) => previous + 1);
    setSelectedChoice(null);
    setFeedback(null);
  };

  const restart = () => {
    setScenarioIndex(0);
    setScore(0);
    setSelectedChoice(null);
    setFeedback(null);
    setIsComplete(false);
    setCelebrateTick(0);
  };

  return (
    <ActivityShell title="// ACTIVITY 1: THREAT OR NOT?">
      {!isComplete ? (
        <div className="relative space-y-4">
          {feedback?.correct && <CelebrationBurst trigger={celebrateTick} />}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={panelClassName}>
              <p className="font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
                Scenario Progress
              </p>
              <p className="mt-1 font-display text-lg text-neon-cyan">
                {scenarioIndex + 1}/{scenarios.length}
              </p>
            </div>
            <div className={panelClassName}>
              <p className="font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">Score</p>
              <p className="mt-1 font-display text-lg text-neon-green">
                {score} / {scenarios.length}
              </p>
            </div>
          </div>

          <div key={currentScenario.id} className="scenario-shell rounded border border-border-bright bg-bg-surface p-5">
            <p className="font-display text-[11px] uppercase tracking-[0.13em] text-neon-cyan">Scenario Card</p>
            <p className="mt-3 text-2xl" aria-hidden="true">
              {currentScenario.icon}
            </p>
            <p className="mt-2 text-lg text-text-primary">{currentScenario.text}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseAnswer('threat')}
                disabled={Boolean(selectedChoice)}
                className={`rounded border px-4 py-4 font-display text-base font-bold uppercase tracking-[0.08em] transition-all ${
                  selectedChoice === 'threat'
                    ? 'border-alert-orange bg-alert-orange-dim text-alert-orange'
                    : 'border-[rgba(255,107,53,0.45)] text-alert-orange hover:bg-alert-orange-dim'
                } ${selectedChoice ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                🚨 Cyber Threat
              </button>
              <button
                type="button"
                onClick={() => chooseAnswer('safe')}
                disabled={Boolean(selectedChoice)}
                className={`rounded border px-4 py-4 font-display text-base font-bold uppercase tracking-[0.08em] transition-all ${
                  selectedChoice === 'safe'
                    ? 'border-neon-green bg-neon-green-glow text-neon-green'
                    : 'border-[rgba(0,255,136,0.4)] text-neon-green hover:bg-neon-green-glow'
                } ${selectedChoice ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                ✅ Safe Action
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded border px-4 py-3 ${
                feedback.correct
                  ? 'border-[rgba(0,255,136,0.4)] bg-[rgba(0,255,136,0.08)]'
                  : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)]'
              }`}
            >
              <p
                className={`font-display text-[11px] uppercase tracking-[0.12em] ${
                  feedback.correct ? 'text-neon-green' : 'text-alert-orange'
                }`}
              >
                {feedback.correct ? 'Correct choice!' : 'Good try!'}
              </p>
              <p className="mt-1 text-sm text-text-secondary">{feedback.text}</p>
              <button type="button" onClick={goNext} className="btn-primary mt-3 w-full">
                {scenarioIndex === scenarios.length - 1 ? 'View Results' : 'Next Scenario'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] p-5 text-center">
          <CelebrationBurst trigger={celebrateTick + 1} />
          <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">Mission Complete</p>
          <h3 className="mt-2 font-display text-2xl text-text-primary">Threat or Not Finished!</h3>
          <p className="mt-2 text-sm text-text-secondary">
            You scored {score} out of {scenarios.length}.
          </p>

          <div className="mt-4">
            <EndStars count={stars} />
            <p className="mt-2 font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">{badge}</p>
          </div>

          <button type="button" onClick={restart} className="btn-secondary mt-5">
            Retry Activity
          </button>
        </div>
      )}
    </ActivityShell>
  );
}

function CiaTriadMatchUpGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const principles = useMemo(
    () =>
      [
        {
          id: 'confidentiality',
          label: 'Confidentiality',
          icon: '🔐',
          definition: 'Keeping information private and secret.',
          learnMore:
            'Only trusted people should see private information, like your account details or school login.',
          colorClass: 'border-[#68f0d0] bg-[rgba(104,240,208,0.1)] text-[#68f0d0]'
        },
        {
          id: 'integrity',
          label: 'Integrity',
          icon: '🧩',
          definition: 'Making sure information is correct and not changed.',
          learnMore: 'Data should stay accurate so people can trust it. Wrong edits can cause mistakes and confusion.',
          colorClass: 'border-[#ffd76a] bg-[rgba(255,215,106,0.1)] text-[#ffd76a]'
        },
        {
          id: 'availability',
          label: 'Availability',
          icon: '⚡',
          definition: 'Making sure systems and information are accessible when needed.',
          learnMore: 'Important tools should be ready when people need them, like school portals during class time.',
          colorClass: 'border-[#7eb1ff] bg-[rgba(126,177,255,0.1)] text-[#7eb1ff]'
        }
      ] as const,
    []
  );

  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string | null>(null);
  const [draggingPrincipleId, setDraggingPrincipleId] = useState<string | null>(null);
  const [activeDropZoneId, setActiveDropZoneId] = useState<string | null>(null);
  const [matchedPrinciples, setMatchedPrinciples] = useState<string[]>([]);
  const [statusText, setStatusText] = useState(
    'Drag a principle card onto the matching meaning. You can also tap card, then tap meaning.'
  );
  const [statusTone, setStatusTone] = useState<MatchStatusTone>('neutral');
  const [mistakes, setMistakes] = useState(0);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [errorPulse, setErrorPulse] = useState<{ principleId: string; definitionId: string } | null>(null);
  const [glowMatch, setGlowMatch] = useState<{ principleId: string; definitionId: string } | null>(null);
  const [celebrateTick, setCelebrateTick] = useState(0);

  const createDefinitionCards = () =>
    shuffleList(
      principles.map((principle) => ({
        id: `def-${principle.id}`,
        principleId: principle.id,
        label: principle.definition
      }))
    );
  const [definitionCards, setDefinitionCards] = useState(createDefinitionCards);

  const isComplete = matchedPrinciples.length === principles.length;
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const principleById = useMemo(
    () => new Map<string, (typeof principles)[number]>(principles.map((principle) => [principle.id, principle])),
    [principles]
  );

  const evaluateMatch = (principleId: string, definitionId: string, expectedPrincipleId: string) => {
    if (matchedPrinciples.includes(expectedPrincipleId) || isComplete) {
      return;
    }

    if (principleId === expectedPrincipleId) {
      setMatchedPrinciples((previous) => {
        if (previous.includes(expectedPrincipleId)) {
          return previous;
        }

        return [...previous, expectedPrincipleId];
      });

      setGlowMatch({ principleId: expectedPrincipleId, definitionId });
      setStatusText('Great match! Success tone ready: Ding!');
      setStatusTone('success');
      setCelebrateTick((previous) => previous + 1);
      setSelectedPrincipleId(null);
      setDraggingPrincipleId(null);
      setActiveDropZoneId(null);

      window.setTimeout(() => {
        setGlowMatch(null);
      }, 700);

      if (matchedPrinciples.length + 1 === principles.length) {
        unlock();
      }

      return;
    }

    setMistakes((previous) => previous + 1);
    setErrorPulse({ principleId, definitionId });
    setStatusText('Not quite. Try another definition.');
    setStatusTone('error');
    setSelectedPrincipleId(null);
    setDraggingPrincipleId(null);
    setActiveDropZoneId(null);

    window.setTimeout(() => {
      setErrorPulse(null);
    }, 500);
  };

  const onSelectPrinciple = (principleId: string) => {
    if (matchedPrinciples.includes(principleId) || isComplete) {
      return;
    }

    setSelectedPrincipleId(principleId);
    const selected = principles.find((item) => item.id === principleId);
    if (selected) {
      setStatusText(`Great. Drag ${selected.label} onto the matching meaning.`);
      setStatusTone('neutral');
    }
  };

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>, principleId: string) => {
    if (matchedPrinciples.includes(principleId) || isComplete) {
      return;
    }

    event.dataTransfer.setData('text/plain', principleId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingPrincipleId(principleId);
    setSelectedPrincipleId(principleId);

    const selected = principleById.get(principleId);
    if (selected) {
      setStatusText(`Drop ${selected.label} on its matching meaning.`);
      setStatusTone('neutral');
    }
  };

  const onDragEnd = () => {
    setDraggingPrincipleId(null);
    setActiveDropZoneId(null);
  };

  const onDragOverDefinition = (
    event: React.DragEvent<HTMLButtonElement>,
    definitionId: string,
    principleId: string
  ) => {
    if (matchedPrinciples.includes(principleId) || isComplete) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setActiveDropZoneId(definitionId);
  };

  const onDropDefinition = (
    event: React.DragEvent<HTMLButtonElement>,
    definitionId: string,
    expectedPrincipleId: string
  ) => {
    event.preventDefault();
    const draggedPrincipleId = event.dataTransfer.getData('text/plain') || draggingPrincipleId;

    if (!draggedPrincipleId) {
      setActiveDropZoneId(null);
      return;
    }

    evaluateMatch(draggedPrincipleId, definitionId, expectedPrincipleId);
  };

  const onSelectDefinition = (definitionId: string, expectedPrincipleId: string) => {
    if (matchedPrinciples.includes(expectedPrincipleId) || isComplete) {
      return;
    }

    if (!selectedPrincipleId && !draggingPrincipleId) {
      setStatusText('Pick or drag a principle card first.');
      setStatusTone('neutral');
      return;
    }

    evaluateMatch(selectedPrincipleId ?? draggingPrincipleId ?? '', definitionId, expectedPrincipleId);
  };

  const restart = () => {
    setDefinitionCards(createDefinitionCards());
    setSelectedPrincipleId(null);
    setDraggingPrincipleId(null);
    setActiveDropZoneId(null);
    setMatchedPrinciples([]);
    setStatusText('Drag a principle card onto the matching meaning. You can also tap card, then tap meaning.');
    setStatusTone('neutral');
    setMistakes(0);
    setShowLearnMore(false);
    setErrorPulse(null);
    setGlowMatch(null);
    setCelebrateTick(0);
  };

  return (
    <ActivityShell title="// ACTIVITY 2: CIA TRIAD MATCH-UP">
      {!isComplete ? (
        <div className="relative space-y-4">
          {glowMatch && <CelebrationBurst trigger={celebrateTick} />}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              Drag each principle into its meaning: <span className="text-neon-cyan">3 matches total</span>
            </p>
            <button type="button" onClick={() => setShowLearnMore(true)} className="btn-ghost">
              Learn More
            </button>
          </div>

          <div
            className={`rounded border px-4 py-3 ${
              statusTone === 'success'
                ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)]'
                : statusTone === 'error'
                  ? 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)]'
                  : 'border-border-dim bg-bg-surface'
            }`}
          >
            <p className="text-sm text-text-secondary">{statusText}</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-3">
              {principles.map((principle) => {
                const isMatched = matchedPrinciples.includes(principle.id);
                const isSelected = selectedPrincipleId === principle.id;
                const isShaking = errorPulse?.principleId === principle.id;
                const isGlowing = glowMatch?.principleId === principle.id;

                return (
                  <button
                    key={principle.id}
                    type="button"
                    draggable={!isMatched}
                    onDragStart={(event) => onDragStart(event, principle.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => onSelectPrinciple(principle.id)}
                    disabled={isMatched}
                    className={`w-full rounded border p-4 text-left transition-all ${principle.colorClass} ${
                      isSelected ? 'ring-2 ring-neon-cyan' : ''
                    } ${isMatched ? 'opacity-95 shadow-[0_0_18px_rgba(0,255,136,0.2)]' : 'cursor-grab active:cursor-grabbing'} ${
                      isGlowing ? 'shadow-[0_0_22px_rgba(0,255,136,0.35)]' : ''
                    } ${isShaking ? 'animate-shake' : ''}`}
                  >
                    <p className="font-display text-[10px] uppercase tracking-[0.12em]">Principle</p>
                    <p className="mt-2 flex items-center gap-2 font-display text-base tracking-[0.03em]">
                      <span aria-hidden="true">{principle.icon}</span>
                      {principle.label}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {definitionCards.map((definition) => {
                const isMatched = matchedPrinciples.includes(definition.principleId);
                const isGlowing = glowMatch?.definitionId === definition.id;
                const isShaking = errorPulse?.definitionId === definition.id;
                const matchedPrinciple = principleById.get(definition.principleId);

                return (
                  <button
                    key={definition.id}
                    type="button"
                    onClick={() => onSelectDefinition(definition.id, definition.principleId)}
                    onDragOver={(event) => onDragOverDefinition(event, definition.id, definition.principleId)}
                    onDragLeave={() =>
                      setActiveDropZoneId((current) => (current === definition.id ? null : current))
                    }
                    onDrop={(event) => onDropDefinition(event, definition.id, definition.principleId)}
                    disabled={isMatched}
                    className={`w-full rounded border border-border-dim bg-bg-surface p-4 text-left transition-all ${
                      isMatched
                        ? matchedPrinciple?.colorClass ?? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)]'
                        : 'hover:border-neon-cyan/50'
                    } ${isGlowing ? 'shadow-[0_0_24px_rgba(0,255,136,0.3)]' : ''} ${
                      isShaking ? 'animate-shake border-alert-orange' : ''
                    } ${
                      activeDropZoneId === definition.id && draggingPrincipleId
                        ? 'border-neon-cyan shadow-[0_0_16px_rgba(0,229,255,0.3)]'
                        : ''
                    }`}
                  >
                    <p
                      className={`font-display text-[10px] uppercase tracking-[0.12em] ${
                        isMatched ? 'text-current/80' : 'text-text-secondary'
                      }`}
                    >
                      Drop Zone
                    </p>
                    <p className={`mt-2 text-sm ${isMatched ? 'text-current' : 'text-text-primary'}`}>
                      {definition.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-text-secondary">
            Matched: <span className="text-neon-green">{matchedPrinciples.length}/3</span>
          </p>
        </div>
      ) : (
        <div className="relative rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] p-5 text-center">
          <CelebrationBurst trigger={celebrateTick + 3} />
          <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">
            Cyber Defender Complete!
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            You matched all CIA principles. Success tone ready: Ding, ding!
          </p>

          <div className="mt-4">
            <EndStars count={stars} />
            <p className="mt-2 font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">
              Mistakes: {mistakes}
            </p>
          </div>

          <button type="button" onClick={restart} className="btn-secondary mt-5">
            Replay Activity
          </button>
        </div>
      )}

      {showLearnMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,8,16,0.78)] px-4">
          <div className="w-full max-w-[680px] rounded border border-border-bright bg-bg-surface p-5 shadow-panel-soft">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg text-text-primary">CIA Triad Learn More</h3>
              <button type="button" onClick={() => setShowLearnMore(false)} className="btn-ghost">
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {principles.map((principle) => (
                <div key={principle.id} className={`rounded border p-3 ${principle.colorClass}`}>
                  <p className="font-display text-[10px] uppercase tracking-[0.12em]">{principle.label}</p>
                  <p className="mt-1 text-sm">{principle.learnMore}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ActivityShell>
  );
}

interface DictionaryEntry {
  id: string;
  term: string;
  definition: string;
  icon: string;
}

interface DictionaryCard {
  id: string;
  pairId: string;
  kind: 'term' | 'definition';
  faceLabel: string;
  icon: string;
}

function buildDictionaryDeck(entries: DictionaryEntry[]): DictionaryCard[] {
  return shuffleList(
    entries.flatMap((entry) => [
      {
        id: `${entry.id}-term`,
        pairId: entry.id,
        kind: 'term',
        faceLabel: entry.term,
        icon: entry.icon
      },
      {
        id: `${entry.id}-definition`,
        pairId: entry.id,
        kind: 'definition',
        faceLabel: entry.definition,
        icon: '📘'
      }
    ])
  );
}

function HackersDictionaryGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const entries = useMemo<DictionaryEntry[]>(
    () => [
      {
        id: 'password',
        term: 'Password',
        definition: 'A secret word used to protect your account.',
        icon: '🔑'
      },
      {
        id: 'firewall',
        term: 'Firewall',
        definition: 'A digital security wall that blocks bad traffic.',
        icon: '🧱'
      },
      {
        id: 'malware',
        term: 'Malware',
        definition: 'Dangerous software that can harm devices.',
        icon: '🦠'
      },
      {
        id: 'hacker',
        term: 'Hacker',
        definition: 'A person who tries to access computer systems.',
        icon: '🕵️'
      },
      {
        id: 'phishing',
        term: 'Phishing',
        definition: 'A trick used to steal personal information.',
        icon: '🎣'
      }
    ],
    []
  );

  const [deck, setDeck] = useState<DictionaryCard[]>(() => buildDictionaryDeck(entries));

  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [statusText, setStatusText] = useState('Flip two cards to match a term with its definition.');
  const [celebrateTick, setCelebrateTick] = useState(0);

  const isComplete = matchedPairIds.length === entries.length;
  const stars = wrongAttempts <= 1 ? 3 : wrongAttempts <= 4 ? 2 : 1;

  useEffect(() => {
    if (flippedCardIds.length !== 2) {
      return;
    }

    const [firstId, secondId] = flippedCardIds;
    const firstCard = deck.find((card) => card.id === firstId);
    const secondCard = deck.find((card) => card.id === secondId);

    if (!firstCard || !secondCard) {
      return;
    }

    const isPairMatch =
      firstCard.pairId === secondCard.pairId && firstCard.kind !== secondCard.kind;

    setIsLocked(true);

    if (isPairMatch) {
      const pairId = firstCard.pairId;
      setStatusText('Great match!');

      window.setTimeout(() => {
        setMatchedPairIds((previous) => {
          if (previous.includes(pairId)) {
            return previous;
          }

          return [...previous, pairId];
        });
        setFlippedCardIds([]);
        setIsLocked(false);
        setCelebrateTick((previous) => previous + 1);
      }, 380);

      return;
    }

    setWrongAttempts((previous) => previous + 1);
    setStatusText('Not a match yet. Try another pair.');

    window.setTimeout(() => {
      setFlippedCardIds([]);
      setIsLocked(false);
    }, 820);
  }, [deck, flippedCardIds]);

  useEffect(() => {
    if (isComplete) {
      setStatusText('All terms matched. Nice work!');
      unlock();
    }
  }, [isComplete, unlock]);

  const onCardClick = (cardId: string) => {
    if (isLocked || isComplete) {
      return;
    }

    const selectedCard = deck.find((card) => card.id === cardId);

    if (!selectedCard || matchedPairIds.includes(selectedCard.pairId) || flippedCardIds.includes(cardId)) {
      return;
    }

    if (flippedCardIds.length === 0) {
      setFlippedCardIds([cardId]);
      return;
    }

    if (flippedCardIds.length === 1) {
      setFlippedCardIds((previous) => [...previous, cardId]);
      setAttempts((previous) => previous + 1);
    }
  };

  const restart = () => {
    setDeck(buildDictionaryDeck(entries));
    setFlippedCardIds([]);
    setMatchedPairIds([]);
    setIsLocked(false);
    setAttempts(0);
    setWrongAttempts(0);
    setStatusText('Flip two cards to match a term with its definition.');
    setCelebrateTick(0);
  };

  return (
    <ActivityShell title="// ACTIVITY 3: HACKER'S DICTIONARY">
      {!isComplete ? (
        <div className="relative space-y-4">
          {celebrateTick > 0 && <CelebrationBurst trigger={celebrateTick + 8} />}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className={panelClassName}>
              <p className="font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">Pairs Found</p>
              <p className="mt-1 font-display text-lg text-neon-green">
                {matchedPairIds.length}/{entries.length}
              </p>
            </div>
            <div className={panelClassName}>
              <p className="font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">Attempts</p>
              <p className="mt-1 font-display text-lg text-neon-cyan">{attempts}</p>
            </div>
            <div className={panelClassName}>
              <p className="font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">Misses</p>
              <p className="mt-1 font-display text-lg text-alert-orange">{wrongAttempts}</p>
            </div>
          </div>

          <div className="rounded border border-border-dim bg-bg-surface px-4 py-3">
            <p className="text-sm text-text-secondary">{statusText}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {deck.map((card) => {
              const isMatched = matchedPairIds.includes(card.pairId);
              const isFlipped = isMatched || flippedCardIds.includes(card.id);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onCardClick(card.id)}
                  className="dictionary-card-shell"
                  disabled={isLocked || isMatched}
                >
                  <span className={`dictionary-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                    <span className="dictionary-card-face dictionary-card-front">
                      <span className="text-xl" aria-hidden="true">
                        {card.kind === 'term' ? card.icon : '📘'}
                      </span>
                      <span className="mt-2 font-display text-[10px] uppercase tracking-[0.11em] text-text-secondary">
                        Tap to Flip
                      </span>
                    </span>
                    <span
                      className={`dictionary-card-face dictionary-card-back ${
                        isMatched
                          ? 'border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.12)]'
                          : 'border-border-bright bg-bg-surface'
                      }`}
                    >
                      <span className="text-base" aria-hidden="true">
                        {card.icon}
                      </span>
                      <span className="mt-2 font-display text-[10px] uppercase tracking-[0.11em] text-neon-cyan">
                        {card.kind === 'term' ? 'Term' : 'Definition'}
                      </span>
                      <span className="mt-1 text-center text-xs text-text-primary">{card.faceLabel}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] p-5 text-center">
          <CelebrationBurst trigger={celebrateTick + 20} />
          <p className="font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">Dictionary Complete</p>
          <h3 className="mt-2 font-display text-2xl text-text-primary">Great Vocabulary Match!</h3>
          <p className="mt-2 text-sm text-text-secondary">
            You matched all 5 cybersecurity terms and definitions.
          </p>

          <div className="mt-4">
            <EndStars count={stars} />
            <p className="mt-2 font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">
              Misses: {wrongAttempts}
            </p>
          </div>

          <button type="button" onClick={restart} className="btn-secondary mt-5">
            Replay Activity
          </button>
        </div>
      )}

      <style jsx>{`
        .scenario-shell {
          animation: scenario-slide-in 300ms ease;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 10px;
          border-radius: 2px;
          opacity: 0;
          animation: confetti-pop 760ms ease-out forwards;
        }

        .dictionary-card-shell {
          position: relative;
          perspective: 900px;
          min-height: 145px;
        }

        .dictionary-card-inner {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          min-height: 145px;
          transform-style: preserve-3d;
          transition: transform 420ms ease;
        }

        .dictionary-card-inner.is-flipped {
          transform: rotateY(180deg);
        }

        .dictionary-card-face {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid;
          padding: 10px;
          backface-visibility: hidden;
        }

        .dictionary-card-front {
          border-color: rgba(149, 164, 195, 0.26);
          background: linear-gradient(160deg, rgba(13, 21, 39, 0.95), rgba(19, 29, 52, 0.92));
        }

        .dictionary-card-back {
          transform: rotateY(180deg);
        }

        @keyframes scenario-slide-in {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes confetti-pop {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.25) rotate(0deg);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--confetti-dx)), var(--confetti-dy))
              rotate(var(--confetti-rot)) scale(1);
          }
        }
      `}</style>
    </ActivityShell>
  );
}

function FoundationsMissionUnavailable({ activityId }: { activityId: string }) {
  return (
    <div className={panelClassName}>
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-alert-orange">
        {'// SIMULATOR MODULE NOT LOADED'}
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        No dedicated beginner activity is mapped to {activityId}.
      </p>
    </div>
  );
}

export function FoundationsActivityExperience({
  activityId,
  challengeFlag,
  onFlagDiscovered
}: FoundationsActivityExperienceProps) {
  const hasNewActivityMapping = [
    'password-builder',
    'footprint-investigator',
    'build-strongest-password',
    'first-letter-cipher',
    'second-letter-cipher',
    'spy-message-relay',
    'spot-deepfake-clue',
    'ai-defender-or-attacker',
    'phishing-email-hunt'
  ].includes(activityId);

  const renderedGame = useMemo(() => {
    if (activityId === 'threat-or-not') {
      return (
        <ThreatOrNotGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />
      );
    }

    if (activityId === 'cia-triad-match-up') {
      return (
        <CiaTriadMatchUpGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />
      );
    }

    if (activityId === 'hackers-dictionary') {
      return (
        <HackersDictionaryGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />
      );
    }

    if (hasNewActivityMapping) {
      return (
        <NewActivitiesExperience
          activityId={activityId}
          challengeFlag={challengeFlag}
          onFlagDiscovered={onFlagDiscovered}
        />
      );
    }

    return <FoundationsMissionUnavailable activityId={activityId} />;
  }, [activityId, challengeFlag, hasNewActivityMapping, onFlagDiscovered]);

  return renderedGame;
}
