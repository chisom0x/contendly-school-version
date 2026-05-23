'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { TerminalCursor } from '@/components/shared/TerminalCursor';

interface Week1ActivityExperienceProps {
  activityId: string;
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

interface GameProps {
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

const panelClassName = 'rounded border border-border-dim bg-bg-surface-2 p-4';
const TIMELINE_EVENTS = [
  { id: 'event-eniac', label: 'ENIAC built', year: 1945 },
  { id: 'event-c', label: 'C programming language created', year: 1972 },
  { id: 'event-gnu', label: 'GNU project announced', year: 1983 },
  { id: 'event-linux', label: 'Linux kernel released', year: 1991 },
  { id: 'event-win95', label: 'Windows 95 released', year: 1995 },
  { id: 'event-google', label: 'Google launched', year: 1998 },
  { id: 'event-facebook', label: 'Facebook launched', year: 2004 },
  { id: 'event-iphone', label: 'First iPhone launched', year: 2007 },
  { id: 'event-github', label: 'GitHub launched', year: 2008 },
  { id: 'event-raspi', label: 'Raspberry Pi released', year: 2012 }
] as const;

function shuffleList<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function useOneTimeUnlock(challengeFlag: string, onFlagDiscovered: (flag: string) => void) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = useCallback(() => {
    setIsUnlocked((previous) => {
      if (previous) {
        return previous;
      }
      onFlagDiscovered(challengeFlag);
      return true;
    });
  }, [challengeFlag, onFlagDiscovered]);

  return { isUnlocked, unlock };
}

function OsIdentifierGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { isUnlocked, unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const prompts = [
    {
      id: 'node-a',
      interfaceLabel: 'Interface A',
      clue:
        'Taskbar-driven UI, Start menu behavior, common .exe install flow, and enterprise workstation defaults.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/92/Windows_11_Desktop.png',
      osName: 'Windows',
      creator: 'Microsoft',
      characteristic: 'Start menu and .exe software ecosystem',
      letter: 'L'
    },
    {
      id: 'node-b',
      interfaceLabel: 'Interface B',
      clue:
        'Dock + Finder workflow with a polished desktop shell and tight hardware integration.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fa/MacOS_Tahoe_screenshot.png',
      osName: 'macOS',
      creator: 'Apple',
      characteristic: 'UNIX-based desktop with Finder and Dock',
      letter: 'I'
    },
    {
      id: 'node-c',
      interfaceLabel: 'Interface C',
      clue:
        'GNOME-first Linux desktop often used by beginners and widely deployed in education labs.',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Ubuntu_25.10_default_desktop_-_English.png/960px-Ubuntu_25.10_default_desktop_-_English.png',
      osName: 'Ubuntu',
      creator: 'Canonical',
      characteristic: 'Beginner-friendly Linux distribution',
      letter: 'N'
    },
    {
      id: 'node-d',
      interfaceLabel: 'Interface D',
      clue:
        'Security-focused distro with penetration-testing tooling and dark-themed tactical UI defaults.',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/VirtualBox_Kali_Linux_29_03_2022_11_10_35.png/960px-VirtualBox_Kali_Linux_29_03_2022_11_10_35.png',
      osName: 'Kali Linux',
      creator: 'Offensive Security',
      characteristic: 'Pen-testing and red-team toolkit focus',
      letter: 'U'
    },
    {
      id: 'node-e',
      interfaceLabel: 'Interface E',
      clue:
        'Small-board deployment profile built for Raspberry Pi devices and lightweight environments.',
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Raspberry_Pi_OS_13_screenshot.png/960px-Raspberry_Pi_OS_13_screenshot.png',
      osName: 'Raspberry Pi OS',
      creator: 'Raspberry Pi Foundation',
      characteristic: 'Optimized for Raspberry Pi hardware',
      letter: 'X'
    }
  ] as const;

  const [answers, setAnswers] = useState<Record<string, { osName: string; creator: string; characteristic: string }>>(
    () =>
      prompts.reduce<Record<string, { osName: string; creator: string; characteristic: string }>>((acc, prompt) => {
        acc[prompt.id] = { osName: '', creator: '', characteristic: '' };
        return acc;
      }, {})
  );
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState('');

  const osOptions = useMemo(
    () => shuffleList(['Windows', 'macOS', 'Ubuntu', 'Kali Linux', 'Raspberry Pi OS']),
    []
  );
  const creatorOptions = useMemo(
    () =>
      shuffleList([
        'Microsoft',
        'Apple',
        'Canonical',
        'Offensive Security',
        'Raspberry Pi Foundation'
      ]),
    []
  );
  const characteristicOptions = useMemo(
    () =>
      shuffleList([
        'Start menu and .exe software ecosystem',
        'UNIX-based desktop with Finder and Dock',
        'Beginner-friendly Linux distribution',
        'Pen-testing and red-team toolkit focus',
        'Optimized for Raspberry Pi hardware'
      ]),
    []
  );

  const revealedWord = prompts
    .map((prompt) => (correctMap[prompt.id] ? prompt.letter : '█'))
    .join('');

  const handleValidate = () => {
    const nextCorrectMap: Record<string, boolean> = {};
    let correctCount = 0;

    prompts.forEach((prompt) => {
      const response = answers[prompt.id];
      const isCorrect =
        response.osName === prompt.osName &&
        response.creator === prompt.creator &&
        response.characteristic === prompt.characteristic;
      nextCorrectMap[prompt.id] = isCorrect;
      if (isCorrect) {
        correctCount += 1;
      }
    });

    setCorrectMap(nextCorrectMap);

    if (correctCount === 5) {
      setFeedback('[ok] all interfaces identified. extraction key: LINUX');
      unlock();
      return;
    }

    setFeedback(`[err] ${correctCount}/5 profiles confirmed. continue analysis.`);
  };

  return (
    <section className="space-y-4">
      <SectionLabel label="// OS IDENTIFIER SIMULATOR" accent="cyan" />
      <p className="text-sm text-text-secondary">
        Identify each interface by OS name, creator, and one defining characteristic. Every fully correct profile reveals one key letter.
      </p>

      <div className="space-y-3">
        {prompts.map((prompt) => {
          const answer = answers[prompt.id];
          const isCorrect = correctMap[prompt.id];

          return (
            <div
              key={prompt.id}
              className={`rounded border p-4 ${
                isCorrect
                  ? 'border-[rgba(0,255,136,0.42)] bg-[rgba(0,255,136,0.06)]'
                  : 'border-border-dim bg-bg-surface'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-[11px] uppercase tracking-[0.13em] text-neon-cyan">
                  {prompt.interfaceLabel}
                </p>
                <p className="font-display text-[11px] uppercase tracking-[0.1em] text-text-secondary">
                  Letter: <span className="text-neon-green">{isCorrect ? prompt.letter : '█'}</span>
                </p>
              </div>

              <p className="mt-2 text-sm text-text-secondary">{prompt.clue}</p>
              <div className="mt-3 overflow-hidden rounded border border-border-dim bg-bg-primary">
                <Image
                  src={prompt.imageUrl}
                  alt={`${prompt.osName} interface screenshot`}
                  width={960}
                  height={540}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <select
                  value={answer.osName}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [prompt.id]: { ...prev[prompt.id], osName: event.target.value }
                    }))
                  }
                  className="terminal-input"
                >
                  <option value="">Select OS</option>
                  {osOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={answer.creator}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [prompt.id]: { ...prev[prompt.id], creator: event.target.value }
                    }))
                  }
                  className="terminal-input"
                >
                  <option value="">Select Creator</option>
                  {creatorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={answer.characteristic}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [prompt.id]: { ...prev[prompt.id], characteristic: event.target.value }
                    }))
                  }
                  className="terminal-input"
                >
                  <option value="">Select Characteristic</option>
                  {characteristicOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className={panelClassName}>
        <p className="font-display text-[11px] uppercase tracking-[0.13em] text-neon-green">
          root@contendly:~$ decode --letters
        </p>
        <p className="mt-2 font-display text-lg tracking-[0.18em] text-neon-green">{revealedWord}</p>
        {feedback && <p className="mt-2 font-display text-[11px] uppercase tracking-[0.1em] text-text-secondary">{feedback}</p>}
        <button type="button" onClick={handleValidate} className="btn-primary mt-3 w-full sm:w-auto">
          VERIFY INTERFACES
        </button>

        {isUnlocked && (
          <p className="mt-3 rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
            [ok] FLAG UNLOCKED: {challengeFlag}
          </p>
        )}
      </div>
    </section>
  );
}

function TimelineScrambleGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { isUnlocked, unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const shuffledInitial = useMemo(() => {
    const copy = [...TIMELINE_EVENTS];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }, []);

  const [ordered, setOrdered] = useState(shuffledInitial);
  const dragIndexRef = useRef<number | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const sortedByYear = useMemo(
    () => [...TIMELINE_EVENTS].sort((left, right) => left.year - right.year),
    []
  );

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }

    setOrdered((current) => {
      const updated = [...current];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleGrade = () => {
    const correctCount = ordered.reduce((count, event, index) => {
      if (event.id === sortedByYear[index]?.id) {
        return count + 1;
      }

      return count;
    }, 0);

    setScore(correctCount);

    if (correctCount >= 8) {
      unlock();
    }
  };

  const handleReset = () => {
    setOrdered(shuffledInitial);
    setScore(null);
  };

  return (
    <section className="space-y-4">
      <SectionLabel label="// TIMELINE SCRAMBLE" accent="cyan" />
      <p className="text-sm text-text-secondary">
        Drag and drop each milestone into chronological order. Score 8/10 or higher to unlock the mission flag.
      </p>

      <div className="space-y-2 rounded border border-border-dim bg-bg-surface p-3">
        {ordered.map((event, index) => (
          <div
            key={event.id}
            draggable
            onDragStart={() => {
              dragIndexRef.current = index;
            }}
            onDragOver={(dragEvent) => {
              dragEvent.preventDefault();
            }}
            onDrop={() => {
              if (dragIndexRef.current === null) {
                return;
              }
              moveRow(dragIndexRef.current, index);
              dragIndexRef.current = null;
            }}
            className="cursor-move rounded border border-border-dim bg-bg-surface-2 px-3 py-2 transition-colors duration-200 hover:border-border-bright"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-[11px] uppercase tracking-[0.12em] text-text-secondary">
                Position {index + 1}
              </p>
              <p className="text-sm text-text-primary">{event.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleGrade} className="btn-primary">
          GRADE TIMELINE
        </button>
        <button type="button" onClick={handleReset} className="btn-ghost">
          RESET ORDER
        </button>
      </div>

      {score !== null && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            score >= 8
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {score >= 8 ? `[ok] timeline stable: ${score}/10 correct` : `[err] ${score}/10 correct. minimum required: 8`}
        </p>
      )}

      {isUnlocked && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          [ok] FLAG UNLOCKED: {challengeFlag}
        </p>
      )}
    </section>
  );
}

function TorvaldsFirstMessageGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { isUnlocked, unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const questions = [
    {
      id: 'q1',
      prompt: 'What was Linus studying when he wrote the post?',
      options: ['Law', 'Computer Science', 'Mechanical Engineering', 'Economics'],
      answer: 'Computer Science'
    },
    {
      id: 'q2',
      prompt: 'Which OS did he mention being frustrated with?',
      options: ['BSD', 'DOS', 'MINIX', 'Solaris'],
      answer: 'MINIX'
    },
    {
      id: 'q3',
      prompt: 'What did he say his project would not be?',
      options: [
        'Portable to every architecture',
        'A graphical desktop shell',
        'Big and professional like GNU',
        'Commercially licensed software'
      ],
      answer: 'Big and professional like GNU'
    },
    {
      id: 'q4',
      prompt: 'What hardware family was he targeting?',
      options: ['ARM laptops', 'IBM mainframes', '386/486 AT clones', 'PowerPC systems'],
      answer: '386/486 AT clones'
    },
    {
      id: 'q5',
      prompt: 'What did he ask readers to send him?',
      options: ['Donations', 'Kernel modules only', 'Bug reports and suggestions', 'Paid subscriptions'],
      answer: 'Bug reports and suggestions'
    }
  ] as const;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const computedScore = questions.reduce((count, question) => {
      if (answers[question.id] === question.answer) {
        return count + 1;
      }

      return count;
    }, 0);

    setScore(computedScore);

    if (computedScore === questions.length) {
      unlock();
    }
  };

  return (
    <section className="space-y-4">
      <SectionLabel label="// TORVALDS LOG ANALYSIS" accent="cyan" />

      <article className="rounded border border-border-dim bg-bg-surface p-4">
        <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-green">
          comp.os.minix // archived snippet
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Hello everybody out there using minix - I am doing a (free) operating system (just a hobby, won&apos;t be
          big and professional like GNU) for 386(486) AT clones. I&apos;ve currently ported bash and gcc and things seem
          to work. This has been brewing since April, and is starting to get ready. I&apos;d like any feedback on things
          people like/dislike in minix, as my OS resembles it somewhat. I&apos;m a computer science student at the
          University of Helsinki.
        </p>
      </article>

      <form onSubmit={handleSubmit} className="space-y-3">
        {questions.map((question) => (
          <div key={question.id} className="rounded border border-border-dim bg-bg-surface-2 p-3">
            <p className="text-sm text-text-primary">{question.prompt}</p>
            <select
              value={answers[question.id] ?? ''}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: event.target.value
                }))
              }
              className="terminal-input mt-2"
            >
              <option value="">Select answer</option>
              {question.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button type="submit" className="btn-primary">
          VERIFY COMPREHENSION
        </button>
      </form>

      {score !== null && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            score === questions.length
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {score === questions.length
            ? '[ok] all comprehension checks passed'
            : `[err] score ${score}/${questions.length}. review message and retry.`}
        </p>
      )}

      {isUnlocked && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          [ok] FLAG UNLOCKED: {challengeFlag}
        </p>
      )}
    </section>
  );
}

function OpenSourceOrClosedGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { isUnlocked, unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const items = [
    { id: 'word', name: 'Microsoft Word', answer: 'Proprietary' },
    { id: 'firefox', name: 'Firefox', answer: 'Open Source' },
    { id: 'chrome', name: 'Google Chrome', answer: 'Proprietary' },
    { id: 'vlc', name: 'VLC Media Player', answer: 'Open Source' },
    { id: 'photoshop', name: 'Adobe Photoshop', answer: 'Proprietary' },
    { id: 'kernel', name: 'Linux kernel', answer: 'Open Source' },
    { id: 'macos', name: 'macOS', answer: 'Proprietary' },
    { id: 'android', name: 'Android (AOSP core)', answer: 'Open Source' }
  ] as const;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);

  const handleGrade = () => {
    const computedScore = items.reduce((count, item) => {
      if (answers[item.id] === item.answer) {
        return count + 1;
      }

      return count;
    }, 0);

    setScore(computedScore);

    if (computedScore >= 7) {
      unlock();
    }
  };

  return (
    <section className="space-y-4">
      <SectionLabel label="// OPEN VS PROPRIETARY" accent="cyan" />
      <p className="text-sm text-text-secondary">
        Categorize each software product correctly. Score at least 7/8 to unlock the mission flag.
      </p>

      <div className="space-y-2">
        {items.map((item) => {
          const selected = answers[item.id] ?? '';

          return (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border-dim bg-bg-surface p-3">
              <p className="text-sm text-text-primary">{item.name}</p>
              <div className="flex gap-2">
                {['Open Source', 'Proprietary'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [item.id]: option
                      }))
                    }
                    className={`rounded-sm border px-3 py-1 font-display text-[10px] uppercase tracking-[0.1em] transition-colors duration-200 ${
                      selected === option
                        ? 'border-neon-green bg-[rgba(0,255,136,0.1)] text-neon-green'
                        : 'border-border-dim text-text-secondary hover:border-border-bright hover:text-text-primary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={handleGrade} className="btn-primary">
        VALIDATE CLASSIFICATION
      </button>

      {score !== null && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            score >= 7
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {score >= 7 ? `[ok] ${score}/8 correct. threshold met.` : `[err] ${score}/8 correct. minimum required: 7`}
        </p>
      )}

      {isUnlocked && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          [ok] FLAG UNLOCKED: {challengeFlag}
        </p>
      )}
    </section>
  );
}

function FirstTerminalGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { isUnlocked, unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const simulatedDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Africa/Lagos'
      }).format(new Date()),
    []
  );

  const commandMap = useMemo(
    () => ({
      whoami: 'kid-defender',
      date: simulatedDate,
      'uname -r': '6.8.0-contendly',
      hostname: 'ctf-shell-01'
    }),
    [simulatedDate]
  );

  const requiredCommands = ['whoami', 'date', 'uname -r', 'hostname'] as const;

  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'Connected to shell-lab-01.',
    'Run: whoami, date, uname -r, hostname'
  ]);
  const [answers, setAnswers] = useState<Record<string, string>>({
    whoami: '',
    date: '',
    'uname -r': '',
    hostname: ''
  });
  const [score, setScore] = useState<number | null>(null);

  const executeCommand = () => {
    const command = commandInput.trim();

    if (!command) {
      return;
    }

    const normalized = command.toLowerCase();
    setHistory((prev) => [...prev, `$ ${command}`]);

    if (normalized === 'clear') {
      setHistory(['Terminal cleared.']);
      setCommandInput('');
      return;
    }

    if (normalized === 'help') {
      setHistory((prev) => [...prev, 'Supported: whoami, date, uname -r, hostname, help, clear']);
      setCommandInput('');
      return;
    }

    const output = commandMap[normalized as keyof typeof commandMap];

    if (output) {
      setHistory((prev) => [...prev, output]);
    } else {
      setHistory((prev) => [...prev, `command not found: ${command}`]);
    }

    setCommandInput('');
  };

  const handleValidateOutputs = () => {
    const computedScore = requiredCommands.reduce((count, command) => {
      if (answers[command].trim() === commandMap[command]) {
        return count + 1;
      }

      return count;
    }, 0);

    setScore(computedScore);

    if (computedScore === requiredCommands.length) {
      unlock();
    }
  };

  return (
    <section className="space-y-4">
      <SectionLabel label="// SHELL LAB CHECKPOINT" accent="cyan" />
      <p className="text-sm text-text-secondary">
        Run all four required commands in the simulator terminal, then submit the exact output in each answer field.
      </p>

      <div className="rounded border border-[rgba(0,229,255,0.22)] bg-[linear-gradient(145deg,rgba(7,12,26,0.92),rgba(14,22,40,0.86))] p-3">
        <div className="mb-2 flex items-center justify-between border-b border-[rgba(149,164,195,0.16)] pb-2">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <p className="font-display text-[10px] uppercase tracking-[0.1em] text-text-secondary">shell-lab://week1</p>
        </div>

        <div className="h-52 space-y-1 overflow-y-auto rounded border border-[rgba(149,164,195,0.14)] bg-[rgba(2,7,18,0.45)] p-3 font-display text-[11px] text-neon-green">
          {history.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <p className="font-display text-[11px] uppercase tracking-[0.11em] text-neon-green">
            kid@defender:~$
          </p>
          <input
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                executeCommand();
              }
            }}
            placeholder="type command"
            className="terminal-input py-2"
          />
          <button type="button" onClick={executeCommand} className="btn-primary px-4 py-2">
            RUN
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded border border-border-dim bg-bg-surface p-4">
        <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">SUBMIT COMMAND OUTPUTS</p>

        {requiredCommands.map((command) => (
          <div key={command}>
            <p className="mb-1 font-display text-[10px] uppercase tracking-[0.1em] text-text-secondary">{command}</p>
            <input
              value={answers[command]}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  [command]: event.target.value
                }))
              }
              className="terminal-input"
              placeholder="paste output"
            />
          </div>
        ))}

        <button type="button" onClick={handleValidateOutputs} className="btn-primary mt-2">
          VALIDATE OUTPUTS
        </button>
      </div>

      {score !== null && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            score === requiredCommands.length
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {score === requiredCommands.length
            ? '[ok] shell link verified. all outputs valid.'
            : `[err] ${score}/4 valid outputs. rerun commands and retry.`}
        </p>
      )}

      {isUnlocked && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          [ok] FLAG UNLOCKED: {challengeFlag}
        </p>
      )}
    </section>
  );
}

function DistroDetectiveGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { isUnlocked, unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const logoBank = [
    { code: 'A', distro: 'Fedora', icon: '∞' },
    { code: 'B', distro: 'Kali Linux', icon: '🐉' },
    { code: 'C', distro: 'Raspberry Pi OS', icon: '🍓' },
    { code: 'D', distro: 'Ubuntu', icon: '◎' },
    { code: 'E', distro: 'Arch Linux', icon: '▲' },
    { code: 'F', distro: 'Debian', icon: '🌀' }
  ] as const;

  const clues = [
    {
      id: 'clue-1',
      text: 'Security testing distribution commonly used for penetration labs.',
      answerCode: 'B'
    },
    {
      id: 'clue-2',
      text: 'Community distro known for beginner accessibility and LTS desktop releases.',
      answerCode: 'D'
    },
    {
      id: 'clue-3',
      text: 'Minimal rolling-release distro associated with a triangular emblem.',
      answerCode: 'E'
    },
    {
      id: 'clue-4',
      text: 'Stable upstream base used by many derivatives, with a spiral mark.',
      answerCode: 'F'
    },
    {
      id: 'clue-5',
      text: 'Lightweight OS variant for single-board devices in classrooms and labs.',
      answerCode: 'C'
    },
    {
      id: 'clue-6',
      text: 'General-purpose distro with a stylized f-like symbol and strong workstation support.',
      answerCode: 'A'
    }
  ] as const;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);

  const handleGrade = () => {
    const computedScore = clues.reduce((count, clue) => {
      if (answers[clue.id] === clue.answerCode) {
        return count + 1;
      }

      return count;
    }, 0);

    setScore(computedScore);

    if (computedScore === clues.length) {
      unlock();
    }
  };

  return (
    <section className="space-y-4">
      <SectionLabel label="// DISTRO DETECTIVE" accent="cyan" />
      <p className="text-sm text-text-secondary">
        Match each clue card to the correct distro logo code. All six matches must be correct.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {logoBank.map((logo) => (
          <div key={logo.code} className="rounded border border-border-dim bg-bg-surface px-3 py-2">
            <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-green">LOGO {logo.code}</p>
            <p className="mt-1 font-display text-2xl text-text-primary">{logo.icon}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {clues.map((clue, index) => (
          <div key={clue.id} className="rounded border border-border-dim bg-bg-surface p-3">
            <p className="text-sm text-text-primary">{index + 1}. {clue.text}</p>
            <select
              value={answers[clue.id] ?? ''}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  [clue.id]: event.target.value
                }))
              }
              className="terminal-input mt-2"
            >
              <option value="">Select Logo Code</option>
              {logoBank.map((logo) => (
                <option key={logo.code} value={logo.code}>
                  {logo.code}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button type="button" onClick={handleGrade} className="btn-primary">
        VERIFY MATCHES
      </button>

      {score !== null && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            score === clues.length
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {score === clues.length
            ? '[ok] distro map resolved. ecosystem recognition complete.'
            : `[err] ${score}/${clues.length} matches correct. keep investigating.`}
        </p>
      )}

      {isUnlocked && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          [ok] FLAG UNLOCKED: {challengeFlag}
        </p>
      )}
    </section>
  );
}

interface GauntletQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
}

const GAUNTLET_TIME_LIMIT_SECONDS = 120;
const GAUNTLET_TOTAL_QUESTIONS = 12;
const GAUNTLET_PASS_SCORE = 10;
const KERNEL_QUIZ_QUESTION_BANK: GauntletQuestion[] = [
  {
    id: 'q01',
    prompt: 'Who created the Linux kernel?',
    options: ['Linus Torvalds', 'Richard Stallman', 'Ken Thompson', 'Bill Gates'],
    answer: 'Linus Torvalds'
  },
  {
    id: 'q02',
    prompt: 'In which year was the Linux kernel first released?',
    options: ['1989', '1991', '1994', '1998'],
    answer: '1991'
  },
  {
    id: 'q03',
    prompt: 'What does GNU stand for?',
    options: ['General Numeric Utility', 'GNU is Not Unix', 'Global Network Unit', 'Graphical Unix'],
    answer: 'GNU is Not Unix'
  },
  {
    id: 'q04',
    prompt: 'Which command shows your current username?',
    options: ['whoami', 'hostname', 'pwd', 'whereis'],
    answer: 'whoami'
  },
  {
    id: 'q05',
    prompt: 'A Linux distribution is best described as:',
    options: [
      'A kernel plus software bundled into an OS',
      'A gaming graphics driver',
      'A web browser extension pack',
      'A cloud account type'
    ],
    answer: 'A kernel plus software bundled into an OS'
  },
  {
    id: 'q06',
    prompt: 'Open source software means:',
    options: [
      'Only paid users can view code',
      'Source code can be inspected and modified',
      'Software has no license',
      'Software cannot be redistributed'
    ],
    answer: 'Source code can be inspected and modified'
  },
  {
    id: 'q07',
    prompt: 'Which command shows the current host name?',
    options: ['hostname', 'id', 'whoami', 'uname -r'],
    answer: 'hostname'
  },
  {
    id: 'q08',
    prompt: 'What does `uname -r` print?',
    options: ['Kernel version', 'Current user', 'IP address', 'System uptime'],
    answer: 'Kernel version'
  },
  {
    id: 'q09',
    prompt: 'Kali Linux is mainly used for:',
    options: ['Penetration testing', 'Video rendering', 'Office accounting', 'Music production'],
    answer: 'Penetration testing'
  },
  {
    id: 'q10',
    prompt: 'Ubuntu is maintained by:',
    options: ['Canonical', 'Red Hat', 'Oracle', 'NVIDIA'],
    answer: 'Canonical'
  },
  {
    id: 'q11',
    prompt: 'The Linux kernel is:',
    options: [
      'The core managing hardware and resources',
      'A desktop wallpaper manager',
      'A package mirror only',
      'An IDE plugin'
    ],
    answer: 'The core managing hardware and resources'
  },
  {
    id: 'q12',
    prompt: 'Which command prints the current date and time?',
    options: ['date', 'clock', 'time', 'cal -n'],
    answer: 'date'
  },
  {
    id: 'q13',
    prompt: 'Which command lists files in a directory?',
    options: ['ls', 'list', 'dirshow', 'scan'],
    answer: 'ls'
  },
  {
    id: 'q14',
    prompt: 'Which command shows your present working directory?',
    options: ['pwd', 'where', 'cwd', 'home'],
    answer: 'pwd'
  },
  {
    id: 'q15',
    prompt: 'Which command displays user and group IDs?',
    options: ['id', 'whoami', 'groupset', 'uid'],
    answer: 'id'
  },
  {
    id: 'q16',
    prompt: 'The `chmod` command is used to:',
    options: ['Change file permissions', 'Create new users', 'Move files', 'Compress logs'],
    answer: 'Change file permissions'
  },
  {
    id: 'q17',
    prompt: 'What does `sudo` let you do?',
    options: [
      'Run commands with elevated privileges',
      'Shut down networking only',
      'Switch keyboard layout',
      'Auto-update shell aliases'
    ],
    answer: 'Run commands with elevated privileges'
  },
  {
    id: 'q18',
    prompt: 'A terminal is primarily:',
    options: [
      'A text interface for command execution',
      'A photo editor',
      'A browser bookmark panel',
      'A disk partition table'
    ],
    answer: 'A text interface for command execution'
  },
  {
    id: 'q19',
    prompt: 'Which distro is optimized for Raspberry Pi hardware?',
    options: ['Raspberry Pi OS', 'Fedora CoreOS', 'OpenBSD', 'Alpine Linux'],
    answer: 'Raspberry Pi OS'
  },
  {
    id: 'q20',
    prompt: 'The default package manager on Ubuntu is:',
    options: ['apt', 'yum', 'pacman', 'zypper'],
    answer: 'apt'
  },
  {
    id: 'q21',
    prompt: 'What does `apt update` do?',
    options: [
      'Refreshes package index metadata',
      'Upgrades the Linux kernel immediately',
      'Deletes obsolete packages',
      'Resets all repository keys'
    ],
    answer: 'Refreshes package index metadata'
  },
  {
    id: 'q22',
    prompt: 'What is the name of the Linux mascot?',
    options: ['Tux', 'Ping', 'Rex', 'Nixie'],
    answer: 'Tux'
  },
  {
    id: 'q23',
    prompt: 'Who started the GNU Project?',
    options: ['Richard Stallman', 'Linus Torvalds', 'Dennis Ritchie', 'Tim Berners-Lee'],
    answer: 'Richard Stallman'
  },
  {
    id: 'q24',
    prompt: 'The Linux kernel is primarily licensed under:',
    options: ['GPLv2', 'MIT', 'Apache 2.0', 'BSD-2-Clause'],
    answer: 'GPLv2'
  },
  {
    id: 'q25',
    prompt: 'LTS in Ubuntu releases means:',
    options: ['Long-Term Support', 'Linux Terminal Suite', 'Layered Transfer Service', 'Local Time Sync'],
    answer: 'Long-Term Support'
  },
  {
    id: 'q26',
    prompt: 'Which browser below is open source?',
    options: ['Firefox', 'Microsoft Edge', 'Safari', 'Opera GX'],
    answer: 'Firefox'
  },
  {
    id: 'q27',
    prompt: 'Which software below is proprietary?',
    options: ['Adobe Photoshop', 'VLC Media Player', 'Linux kernel', 'Blender'],
    answer: 'Adobe Photoshop'
  },
  {
    id: 'q28',
    prompt: 'In his first post, Torvalds said he was frustrated with:',
    options: ['MINIX', 'DOS', 'Solaris', 'AIX'],
    answer: 'MINIX'
  },
  {
    id: 'q29',
    prompt: 'Torvalds originally targeted which hardware family?',
    options: ['386/486 AT clones', 'ARM tablets', 'PowerPC servers', 'SPARC workstations'],
    answer: '386/486 AT clones'
  },
  {
    id: 'q30',
    prompt: 'What did Torvalds ask readers for in his post?',
    options: ['Bug reports and suggestions', 'Donations only', 'Pre-orders', 'License fees'],
    answer: 'Bug reports and suggestions'
  },
  {
    id: 'q31',
    prompt: 'Torvalds described his project as not being:',
    options: [
      'Big and professional like GNU',
      'Open to feedback',
      'For 386/486 AT clones',
      'A free operating system'
    ],
    answer: 'Big and professional like GNU'
  },
  {
    id: 'q32',
    prompt: 'Which command creates a new directory?',
    options: ['mkdir', 'mkfile', 'newdir', 'rmdir'],
    answer: 'mkdir'
  },
  {
    id: 'q33',
    prompt: 'Which command removes an empty directory?',
    options: ['rmdir', 'rm -rf', 'deldir', 'unlink'],
    answer: 'rmdir'
  },
  {
    id: 'q34',
    prompt: 'Which command copies files?',
    options: ['cp', 'mv', 'cat', 'ln'],
    answer: 'cp'
  },
  {
    id: 'q35',
    prompt: 'Which command moves or renames files?',
    options: ['mv', 'cp', 'renameall', 'lsmv'],
    answer: 'mv'
  },
  {
    id: 'q36',
    prompt: 'Which command deletes a file?',
    options: ['rm', 'erase', 'removef', 'drop'],
    answer: 'rm'
  },
  {
    id: 'q37',
    prompt: 'Which command prints file contents to the terminal?',
    options: ['cat', 'open', 'show', 'readfile'],
    answer: 'cat'
  },
  {
    id: 'q38',
    prompt: 'Which command opens manual pages for commands?',
    options: ['man', 'helpme', 'docs', 'info -h'],
    answer: 'man'
  },
  {
    id: 'q39',
    prompt: 'Which command clears the terminal screen?',
    options: ['clear', 'cls', 'wipe', 'resetline'],
    answer: 'clear'
  },
  {
    id: 'q40',
    prompt: 'Which command prints broader system info including kernel and architecture?',
    options: ['uname -a', 'whoami -a', 'hostname -a', 'date -a'],
    answer: 'uname -a'
  },
  {
    id: 'q41',
    prompt: 'Approximately what share of web servers run Linux?',
    options: ['Around 70%+', 'Around 10%', 'Around 25%', 'Around 40%'],
    answer: 'Around 70%+'
  },
  {
    id: 'q42',
    prompt: 'Android is built on top of which kernel?',
    options: ['Linux kernel', 'XNU kernel', 'NT kernel', 'BSD kernel'],
    answer: 'Linux kernel'
  },
  {
    id: 'q43',
    prompt: 'Which option best describes proprietary software?',
    options: [
      'Source code is usually closed and usage is license-restricted',
      'Source code must be public for everyone',
      'It is always free of charge',
      'It cannot be sold commercially'
    ],
    answer: 'Source code is usually closed and usage is license-restricted'
  },
  {
    id: 'q44',
    prompt: 'Which media player below is open source?',
    options: ['VLC Media Player', 'Final Cut Pro', 'Adobe Premiere Pro', 'Ableton Live'],
    answer: 'VLC Media Player'
  },
  {
    id: 'q45',
    prompt: 'Which command shows logged-in users?',
    options: ['who', 'where', 'login', 'usrstat'],
    answer: 'who'
  },
  {
    id: 'q46',
    prompt: 'Which command lists hidden files in the current directory?',
    options: ['ls -a', 'ls --public', 'showhidden', 'dir -h'],
    answer: 'ls -a'
  },
  {
    id: 'q47',
    prompt: 'Which command can print your username from an environment variable?',
    options: ['echo $USER', 'print user', 'whoami --env', 'env --name'],
    answer: 'echo $USER'
  },
  {
    id: 'q48',
    prompt: 'In Linux architecture, the kernel is:',
    options: [
      'The central component between hardware and software',
      'A desktop theme engine',
      'Only a package installer',
      'A cloud synchronization daemon'
    ],
    answer: 'The central component between hardware and software'
  }
];

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function sampleGauntletQuestions(): GauntletQuestion[] {
  const sampled = shuffleList(KERNEL_QUIZ_QUESTION_BANK).slice(0, GAUNTLET_TOTAL_QUESTIONS);

  return sampled.map((question) => ({
    ...question,
    options: shuffleList([...question.options])
  }));
}

function KernelQuizGauntletGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { isUnlocked, unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const [questions, setQuestions] = useState<GauntletQuestion[]>(() => sampleGauntletQuestions());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [didTimeExpire, setDidTimeExpire] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAUNTLET_TIME_LIMIT_SECONDS);
  const [revealLines, setRevealLines] = useState<string[]>([]);

  const passed = isComplete && correctCount >= GAUNTLET_PASS_SCORE;

  useEffect(() => {
    if (isComplete) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  useEffect(() => {
    if (timeRemaining !== 0 || isComplete) {
      return;
    }

    setDidTimeExpire(true);
    setIsComplete(true);
  }, [isComplete, timeRemaining]);

  useEffect(() => {
    if (!passed) {
      return;
    }

    const lines = [
      '[ok] evaluating gauntlet score...',
      `[ok] score locked at ${correctCount}/${questions.length}`,
      '[ok] threshold met. decrypting boss payload...',
      `[ok] BOSS FLAG REVEALED: ${challengeFlag}`
    ];

    setRevealLines([]);

    lines.forEach((line, index) => {
      setTimeout(() => {
        setRevealLines((prev) => [...prev, line]);
      }, 450 * (index + 1));
    });

    unlock();
  }, [challengeFlag, correctCount, passed, questions.length, unlock]);

  const handleNext = () => {
    if (!selectedOption || isComplete) {
      return;
    }

    const currentQuestion = questions[questionIndex];
    const updatedCorrectCount =
      selectedOption === currentQuestion.answer ? correctCount + 1 : correctCount;

    if (questionIndex === questions.length - 1) {
      setCorrectCount(updatedCorrectCount);
      setIsComplete(true);
      return;
    }

    setCorrectCount(updatedCorrectCount);
    setQuestionIndex((prev) => prev + 1);
    setSelectedOption('');
  };

  const handleRestart = () => {
    setQuestions(sampleGauntletQuestions());
    setQuestionIndex(0);
    setSelectedOption('');
    setCorrectCount(0);
    setIsComplete(false);
    setDidTimeExpire(false);
    setTimeRemaining(GAUNTLET_TIME_LIMIT_SECONDS);
    setRevealLines([]);
  };

  if (isComplete) {
    return (
      <section className="space-y-4">
        <SectionLabel label="// KERNEL QUIZ GAUNTLET" accent="orange" />
        <div
          className={`rounded border p-4 ${
            passed
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)]'
              : 'border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-[11px] uppercase tracking-[0.12em] text-text-primary">
              Final Score: {correctCount}/{questions.length}
            </p>
            <p className="font-display text-[18px] tracking-[0.08em] text-alert-orange">
              {formatCountdown(timeRemaining)}
            </p>
          </div>

          <p className="mt-2 text-sm text-text-secondary">
            {passed
              ? 'Boss threshold cleared within the gauntlet window. Mission payload decrypting below.'
              : didTimeExpire
                ? `Time expired. You needed ${GAUNTLET_PASS_SCORE}+ correct before 00:00 to unlock the boss flag.`
                : `Threshold not met. You need ${GAUNTLET_PASS_SCORE} or more correct to unlock the boss flag.`}
          </p>

          {passed && (
            <div className="mt-3 rounded border border-[rgba(0,255,136,0.24)] bg-[rgba(0,255,136,0.06)] p-3 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
              {revealLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}

          <div className="mt-3">
            <button type="button" onClick={handleRestart} className="btn-ghost">
              RETAKE GAUNTLET
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentQuestion = questions[questionIndex];
  const timerClass =
    timeRemaining <= 30
      ? 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
      : 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green';

  return (
    <section className="space-y-4">
      <SectionLabel label="// KERNEL QUIZ GAUNTLET" accent="orange" />
      <p className="text-sm text-text-secondary">
        2-minute boss window. Each run draws 12 randomized questions from a 48-question bank. Score 10+ before time runs out.
      </p>

      <div className={`rounded border px-3 py-2 font-display text-center text-[26px] tracking-[0.12em] ${timerClass}`}>
        {formatCountdown(timeRemaining)}
      </div>

      <div className="rounded border border-border-dim bg-bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-[11px] uppercase tracking-[0.12em] text-neon-cyan">
            Question {questionIndex + 1} / {questions.length}
          </p>
          <p className="font-display text-[11px] uppercase tracking-[0.1em] text-text-secondary">
            Current score: {correctCount}
          </p>
        </div>

        <p className="mt-3 text-sm text-text-primary">{currentQuestion.prompt}</p>

        <div className="mt-3 space-y-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedOption(option)}
              className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left transition-colors duration-200 ${
                selectedOption === option
                  ? 'border-neon-green bg-[rgba(0,255,136,0.08)] text-neon-green'
                  : 'border-border-dim bg-bg-surface-2 text-text-secondary hover:border-border-bright hover:text-text-primary'
              }`}
            >
              <span className="text-sm">{option}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedOption}
          className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {questionIndex === questions.length - 1 ? 'FINALIZE GAUNTLET' : 'LOCK ANSWER'}
        </button>
      </div>

      {isUnlocked && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          [ok] FLAG UNLOCKED: {challengeFlag}
        </p>
      )}
    </section>
  );
}

function Week1MissionUnavailable({ activityId }: { activityId: string }) {
  return (
    <section className="space-y-3">
      <SectionLabel label="// WEEK 1 SIMULATOR" accent="cyan" />
      <p className="rounded border border-[rgba(255,107,53,0.4)] bg-[rgba(255,107,53,0.12)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-alert-orange">
        [err] simulator module missing for activity id: {activityId}
      </p>
    </section>
  );
}

function Week1ChallengeShell({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 border-t border-border-dim pt-5">
      <div className="mb-3 flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.13em] text-neon-green">
        kid@defender:~$ week1 --launch
        <TerminalCursor className="h-[11px] w-[6px] bg-neon-green" />
      </div>
      {children}
    </div>
  );
}

export function Week1ActivityExperience({
  activityId,
  challengeFlag,
  onFlagDiscovered
}: Week1ActivityExperienceProps) {
  const renderChallenge = () => {
    if (activityId === 'os-identifier') {
      return <OsIdentifierGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'timeline-scramble') {
      return <TimelineScrambleGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'torvalds-first-message') {
      return (
        <TorvaldsFirstMessageGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />
      );
    }

    if (activityId === 'open-source-or-closed') {
      return <OpenSourceOrClosedGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'the-first-terminal') {
      return <FirstTerminalGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'distro-detective') {
      return <DistroDetectiveGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'kernel-quiz-gauntlet') {
      return <KernelQuizGauntletGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    return <Week1MissionUnavailable activityId={activityId} />;
  };

  return <Week1ChallengeShell>{renderChallenge()}</Week1ChallengeShell>;
}
