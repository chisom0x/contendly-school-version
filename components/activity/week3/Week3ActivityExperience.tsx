'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { TerminalCursor } from '@/components/shared/TerminalCursor';

interface Week3ActivityExperienceProps {
  activityId: string;
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

interface GameProps {
  challengeFlag: string;
  onFlagDiscovered: (flag: string) => void;
}

interface TerminalResult {
  output?: string[];
  clear?: boolean;
}

interface BrowserTerminalProps {
  title: string;
  endpoint: string;
  prompt?: string;
  introLines?: string[];
  onCommand: (command: string) => TerminalResult;
}

const panelClassName = 'rounded border border-border-dim bg-bg-surface-2 p-4';

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeLower(value: string) {
  return normalizeText(value).toLowerCase();
}

function reverseText(value: string) {
  return value.split('').reverse().join('');
}

function caesarShift(value: string, shift: number) {
  return value.replace(/[a-z]/gi, (char) => {
    const isUpper = char >= 'A' && char <= 'Z';
    const base = isUpper ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
    const offset = char.charCodeAt(0) - base;
    const shifted = (offset + shift + 26) % 26;
    return String.fromCharCode(base + shifted);
  });
}

function rot13(value: string) {
  return caesarShift(value, 13);
}

function tokenizeCommand(command: string) {
  return normalizeText(command).split(' ').filter(Boolean);
}

function shellCommandNotFound(command: string) {
  return `bash: ${command}: command not found`;
}

function shuffleList<T>(items: T[]) {
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

function BrowserTerminal({
  title,
  endpoint,
  prompt = 'analyst@ctflab:~$',
  introLines = [],
  onCommand
}: BrowserTerminalProps) {
  const [history, setHistory] = useState<string[]>(introLines);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [draftCommand, setDraftCommand] = useState('');
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [history]);

  const executeCommand = () => {
    const command = commandInput.trim();

    if (!command) {
      return;
    }

    const result = onCommand(command);

    setHistory((previous) => {
      if (result.clear) {
        return result.output?.length ? [...result.output] : [];
      }

      const next = [...previous, `${prompt} ${command}`];
      if (result.output?.length) {
        next.push(...result.output);
      }
      return next;
    });

    setCommandHistory((previous) => [...previous, command]);
    setHistoryCursor(null);
    setDraftCommand('');
    setCommandInput('');
  };

  return (
    <div className="overflow-hidden rounded border border-[rgba(0,229,255,0.24)] bg-[linear-gradient(150deg,rgba(8,13,28,0.96),rgba(12,18,34,0.92))]">
      <div className="flex items-center justify-between border-b border-[rgba(149,164,195,0.2)] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <p className="font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">{title}</p>
      </div>

      <div className="border-b border-[rgba(149,164,195,0.12)] px-3 py-1.5">
        <p className="font-display text-[10px] uppercase tracking-[0.12em] text-neon-cyan">{endpoint}</p>
      </div>

      <div
        ref={viewportRef}
        className="h-56 space-y-1 overflow-y-auto bg-[rgba(2,7,18,0.5)] p-3 font-mono text-[12px] leading-relaxed text-neon-green"
      >
        {history.length === 0 ? (
          <p className="text-text-secondary">Terminal ready.</p>
        ) : (
          history.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-[rgba(149,164,195,0.12)] px-3 py-2">
        <p className="font-display text-[11px] uppercase tracking-[0.11em] text-neon-green">{prompt}</p>
        <input
          value={commandInput}
          onChange={(event) => setCommandInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              executeCommand();
              return;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();

              if (commandHistory.length === 0) {
                return;
              }

              if (historyCursor === null) {
                setDraftCommand(commandInput);
                const nextIndex = commandHistory.length - 1;
                setHistoryCursor(nextIndex);
                setCommandInput(commandHistory[nextIndex]);
                return;
              }

              const nextIndex = Math.max(0, historyCursor - 1);
              setHistoryCursor(nextIndex);
              setCommandInput(commandHistory[nextIndex]);
              return;
            }

            if (event.key === 'ArrowDown') {
              if (historyCursor === null) {
                return;
              }

              event.preventDefault();

              if (historyCursor >= commandHistory.length - 1) {
                setHistoryCursor(null);
                setCommandInput(draftCommand);
                return;
              }

              const nextIndex = historyCursor + 1;
              setHistoryCursor(nextIndex);
              setCommandInput(commandHistory[nextIndex]);
            }
          }}
          placeholder="type command"
          className="terminal-input py-2"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="button" onClick={executeCommand} className="btn-primary px-4 py-2">
          RUN
        </button>
      </div>
      <p className="border-t border-[rgba(149,164,195,0.08)] px-3 py-1.5 font-display text-[9px] uppercase tracking-[0.12em] text-text-dim">
        terminal hint: use ↑ / ↓ for command history
      </p>
    </div>
  );
}

function Week3ChallengeShell({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="rounded border border-[rgba(90,132,255,0.28)] bg-[linear-gradient(180deg,rgba(11,14,28,0.95),rgba(14,20,38,0.98))] p-4 shadow-[0_0_0_1px_rgba(90,132,255,0.1),0_16px_30px_rgba(0,0,0,0.3)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// WEEK 3: NETWORK OPS LAB" accent="cyan" />
          <p className="flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.14em] text-neon-green">
            kid@defender:~$ week3 --launch
            <TerminalCursor className="h-[10px] w-[6px] bg-neon-green" />
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

function Week3MissionUnavailable({ activityId }: { activityId: string }) {
  return (
    <div className={panelClassName}>
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-alert-orange">
        {'// SIMULATOR MODULE NOT LOADED'}
      </p>
      <p className="mt-2 text-sm text-text-secondary">No dedicated week 3 experience is mapped to {activityId}.</p>
    </div>
  );
}

function IpDetectiveGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const devices = useMemo(
    () =>
      shuffleList([
    { id: 'dev-01', name: 'Gateway Router', role: 'Edge', ip: '10.0.0.1', segment: 'Core' },
    { id: 'dev-02', name: 'Core Switch', role: 'Switch', ip: '10.0.0.2', segment: 'Core' },
    { id: 'dev-03', name: 'Auth Server', role: 'Server', ip: '10.0.1.10', segment: 'Server VLAN' },
    { id: 'dev-04', name: 'DNS Resolver', role: 'Server', ip: '172.21.1.20', segment: 'Server VLAN' },
    { id: 'dev-05', name: 'Staff Laptop A', role: 'Endpoint', ip: '192.168.10.14', segment: 'Staff VLAN' },
    { id: 'dev-06', name: 'Staff Laptop B', role: 'Endpoint', ip: '192.168.10.27', segment: 'Staff VLAN' },
    { id: 'dev-07', name: 'Lab PC 01', role: 'Endpoint', ip: '172.19.20.11', segment: 'Lab VLAN' },
    { id: 'dev-08', name: 'Lab PC 02', role: 'Endpoint', ip: '192.168.20.18', segment: 'Lab VLAN' },
    { id: 'dev-09', name: 'Printer', role: 'Peripheral', ip: '192.168.10.50', segment: 'Staff VLAN' },
    { id: 'dev-10', name: 'CCTV NVR', role: 'Security', ip: '10.0.2.5', segment: 'IoT VLAN' },
    { id: 'dev-11', name: 'Wi-Fi Controller', role: 'Controller', ip: '172.16.3.2', segment: 'Infrastructure' },
    { id: 'dev-12', name: 'Unknown Device', role: 'Rogue', ip: '45.88.201.77', segment: 'Staff VLAN' }
      ]),
    []
  );

  const rogueIp = '45.88.201.77';
  const [analysis, setAnalysis] = useState({
    nonPrivateCount: '',
    rogueDevice: '',
    rogueSegment: '',
    rogueIp: ''
  });
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    const countCorrect = normalizeText(analysis.nonPrivateCount) === '1';
    const deviceInput = normalizeLower(analysis.rogueDevice);
    const deviceCorrect =
      deviceInput.includes('unknown device') || deviceInput.includes('dev-12');
    const segmentCorrect = normalizeLower(analysis.rogueSegment) === 'staff vlan';
    const ipCorrect = normalizeLower(analysis.rogueIp) === rogueIp;

    const isMatch = countCorrect && deviceCorrect && segmentCorrect && ipCorrect;
    setIsCorrect(isMatch);

    if (isMatch) {
      setFeedback('[ok] rogue host isolated. unauthorized public-range endpoint confirmed.');
      unlock();
      return;
    }

    const issues: string[] = [];

    if (!countCorrect) {
      issues.push('non-private count mismatch');
    }
    if (!deviceCorrect) {
      issues.push('rogue device label mismatch');
    }
    if (!segmentCorrect) {
      issues.push('rogue segment mismatch');
    }
    if (!ipCorrect) {
      issues.push('rogue IP mismatch');
    }

    setFeedback(`[err] ${issues.join(' | ')}. keep investigating.`);
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// IP DETECTIVE" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            identify the rogue endpoint
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          One endpoint uses a non-private address and is connected where it should not be. Complete all four fields:
          count non-private hosts, identify device label, identify segment, and submit rogue IP.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((device) => (
          <div key={device.id} className="rounded border border-border-dim bg-bg-primary p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-[10px] uppercase tracking-[0.13em] text-neon-cyan">{device.role}</p>
              <p className="font-display text-[10px] uppercase tracking-[0.1em] text-text-secondary">
                {device.segment}
              </p>
            </div>
            <p className="mt-2 font-display text-[10px] uppercase tracking-[0.11em] text-text-secondary">{device.id}</p>
            <p className="mt-1 text-sm text-text-primary">{device.name}</p>
            <p className="mt-1 font-mono text-sm text-neon-green">{device.ip}</p>
          </div>
        ))}
      </div>

      <div className={`${panelClassName} grid gap-3 md:grid-cols-2`}>
        <p className="font-display text-[10px] uppercase tracking-[0.13em] text-neon-green">
          private range reminder: 10.x.x.x, 172.16.x.x-172.31.x.x, 192.168.x.x
        </p>
        <div />

        <label>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
            How many non-private IPs?
          </span>
          <input
            value={analysis.nonPrivateCount}
            onChange={(event) => setAnalysis((prev) => ({ ...prev, nonPrivateCount: event.target.value }))}
            placeholder="e.g. 1"
            className="terminal-input"
            autoComplete="off"
          />
        </label>

        <label>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
            Rogue device label
          </span>
          <input
            value={analysis.rogueDevice}
            onChange={(event) => setAnalysis((prev) => ({ ...prev, rogueDevice: event.target.value }))}
            placeholder="e.g. DEV-12 or Unknown Device"
            className="terminal-input"
            autoComplete="off"
          />
        </label>

        <label>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
            Rogue segment
          </span>
          <select
            value={analysis.rogueSegment}
            onChange={(event) => setAnalysis((prev) => ({ ...prev, rogueSegment: event.target.value }))}
            className="terminal-input"
          >
            <option value="">Select segment</option>
            <option value="Core">Core</option>
            <option value="Server VLAN">Server VLAN</option>
            <option value="Staff VLAN">Staff VLAN</option>
            <option value="Lab VLAN">Lab VLAN</option>
            <option value="IoT VLAN">IoT VLAN</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.12em] text-text-secondary">
            Rogue IP
          </span>
          <input
            value={analysis.rogueIp}
            onChange={(event) => setAnalysis((prev) => ({ ...prev, rogueIp: event.target.value }))}
            placeholder="Enter rogue IP"
            className="terminal-input"
            autoComplete="off"
          />
        </label>

        <button type="button" onClick={handleSubmit} className="btn-primary md:col-span-2">
          ISOLATE DEVICE
        </button>
      </div>

      {feedback && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            isCorrect
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

function ViewSourceTreasureHuntGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [tab, setTab] = useState<'preview' | 'source' | 'styles' | 'elements'>('preview');
  const [answers, setAnswers] = useState({
    comment: '',
    hiddenInput: '',
    cssContent: '',
    dataSecret: '',
    hiddenText: '',
    imageAlt: ''
  });
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const expected = {
    comment: 'FLAG{',
    hiddenInput: 'SOURCE_',
    cssContent: 'CACHE_',
    dataSecret: 'CR',
    hiddenText: 'ACKED',
    imageAlt: '}'
  };

  const sourceCode = `<!doctype html>
<html>
  <head>
    <title>Hackathon Project Showcase</title>
  </head>
  <body>
    <!-- fragment: FLAG{ -->
    <section class="hero">
      <h1>Hackathon Showcase</h1>
      <form>
        <input type="hidden" name="artifact" value="SOURCE_" />
      </form>
    </section>
  </body>
</html>`;

  const stylesCode = `.hero::after {
  content: "CACHE_";
  position: absolute;
  left: -9999px;
}`;

  const elementsCode = `<div class="showcase-card" data-secret="CR">
  <p class="visible-copy">Best Student Projects 2026</p>
  <p style="background:#ffffff;color:#ffffff">ACKED</p>
  <img src="/assets/banner-hidden.png" style="display:none" alt="}" />
</div>`;

  const handleValidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const match = Object.entries(expected).every(([key, value]) => {
      return normalizeText(answers[key as keyof typeof answers]) === value;
    });

    setIsCorrect(match);

    if (match) {
      setFeedback('[ok] all six fragments verified. source and live DOM analysis complete.');
      unlock();
      return;
    }

    const count = Object.entries(expected).reduce((sum, [key, value]) => {
      return normalizeText(answers[key as keyof typeof answers]) === value ? sum + 1 : sum;
    }, 0);
    setFeedback(`[err] ${count}/6 fragments matched. check source + devtools elements again.`);
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// VIEW SOURCE TREASURE HUNT" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            devtools required
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Six fragments are hidden across source and live DOM locations. Some are only visible in the Elements panel.
        </p>
      </div>

      <div className={panelClassName}>
        <div className="mb-3 flex flex-wrap gap-2">
          {(['preview', 'source', 'styles', 'elements'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded border px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.12em] transition-colors ${
                tab === item
                  ? 'border-neon-green bg-[rgba(0,255,136,0.12)] text-neon-green'
                  : 'border-border-dim bg-bg-primary text-text-secondary hover:border-border-bright hover:text-text-primary'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === 'preview' && (
          <div className="rounded border border-border-dim bg-white p-6 text-[#0f172a]">
            <h3 className="text-lg font-semibold">Hackathon Project Showcase</h3>
            <p className="mt-2 text-sm text-slate-700">
              Browse student projects and inspect featured entries from web, networking, and reverse engineering tracks.
            </p>
            <div className="mt-4 rounded bg-slate-100 p-4">
              <p className="text-sm text-slate-700">Highlights update every 30 minutes.</p>
            </div>
            <p className="mt-3 text-[12px] text-white">ACKED</p>
          </div>
        )}

        {tab === 'source' && (
          <pre className="overflow-x-auto rounded border border-border-dim bg-bg-primary p-3 font-mono text-[12px] text-neon-green">
            {sourceCode}
          </pre>
        )}

        {tab === 'styles' && (
          <pre className="overflow-x-auto rounded border border-border-dim bg-bg-primary p-3 font-mono text-[12px] text-neon-green">
            {stylesCode}
          </pre>
        )}

        {tab === 'elements' && (
          <pre className="overflow-x-auto rounded border border-border-dim bg-bg-primary p-3 font-mono text-[12px] text-neon-green">
            {elementsCode}
          </pre>
        )}
      </div>

      <form onSubmit={handleValidate} className="grid gap-3 md:grid-cols-2">
        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            HTML comment fragment
          </span>
          <input
            value={answers.comment}
            onChange={(event) => setAnswers((prev) => ({ ...prev, comment: event.target.value }))}
            className="terminal-input"
            placeholder="..."
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            Hidden input value
          </span>
          <input
            value={answers.hiddenInput}
            onChange={(event) => setAnswers((prev) => ({ ...prev, hiddenInput: event.target.value }))}
            className="terminal-input"
            placeholder="..."
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            CSS content property
          </span>
          <input
            value={answers.cssContent}
            onChange={(event) => setAnswers((prev) => ({ ...prev, cssContent: event.target.value }))}
            className="terminal-input"
            placeholder="..."
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            data-secret attribute
          </span>
          <input
            value={answers.dataSecret}
            onChange={(event) => setAnswers((prev) => ({ ...prev, dataSecret: event.target.value }))}
            className="terminal-input"
            placeholder="..."
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            Hidden white text
          </span>
          <input
            value={answers.hiddenText}
            onChange={(event) => setAnswers((prev) => ({ ...prev, hiddenText: event.target.value }))}
            className="terminal-input"
            placeholder="..."
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            Hidden image alt text
          </span>
          <input
            value={answers.imageAlt}
            onChange={(event) => setAnswers((prev) => ({ ...prev, imageAlt: event.target.value }))}
            className="terminal-input"
            placeholder="..."
          />
        </label>

        <button type="submit" className="btn-primary md:col-span-2">
          VALIDATE FRAGMENTS
        </button>
      </form>

      {feedback && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            isCorrect
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

function MultiCipherGauntletGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const plainMessage = `Mission relay confirms flag ${challengeFlag} in packet stream.`;
  const encodedText = useMemo(() => reverseText(rot13(caesarShift(plainMessage, 5))), [plainMessage]);
  const [cwd, setCwd] = useState('/home/analyst');
  const [stageOne, setStageOne] = useState<string | null>(null);
  const [stageTwo, setStageTwo] = useState<string | null>(null);
  const [stageThree, setStageThree] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const [cmd, ...args] = tokens;
      const normalized = normalizeLower(command);
      const shellCommand = tokens.join(' ');

      const resolveDir = (target: string) => {
        if (target === '~' || target === '/home/analyst' || target === '.') {
          return '/home/analyst';
        }

        if (
          target === 'evidence' ||
          target === '/home/analyst/evidence' ||
          (target === '..' && cwd === '/home/analyst/evidence')
        ) {
          return target === '..' ? '/home/analyst' : '/home/analyst/evidence';
        }

        if (target === '..') {
          return '/home/analyst';
        }

        return null;
      };

      const resolveEvidenceFile = (value: string) => {
        if (!value) {
          return null;
        }

        if (value.startsWith('/home/analyst/evidence/')) {
          return value.replace('/home/analyst/evidence/', '');
        }

        if (value.startsWith('evidence/')) {
          return value.replace('evidence/', '');
        }

        if (cwd === '/home/analyst/evidence') {
          return value;
        }

        return null;
      };

      if (normalized === 'help') {
        return {
          output: [
            'Commands:',
            'pwd',
            'cd <dir>',
            'ls',
            'cat cipher.txt',
            'cat riddle.txt',
            'reverse cipher.txt',
            'rot13 stage1.txt',
            'caesar stage2.txt -5',
            'cat stage3.txt',
            'clear'
          ]
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (cmd === 'pwd') {
        if (args.length > 0) {
          return { output: ['pwd: too many arguments'] };
        }

        return { output: [cwd] };
      }

      if (cmd === 'cd') {
        if (args.length !== 1) {
          return { output: ['usage: cd <directory>'] };
        }

        const nextDir = resolveDir(args[0]);

        if (!nextDir) {
          return { output: [`cd: no such file or directory: ${args[0]}`] };
        }

        setCwd(nextDir);
        return { output: [] };
      }

      if (cmd === 'ls') {
        if (args.length > 1) {
          return { output: ['usage: ls [directory]'] };
        }

        const target = args[0] ? resolveDir(args[0]) : cwd;

        if (!target) {
          return { output: [`ls: cannot access '${args[0]}': No such file or directory`] };
        }

        if (target === '/home/analyst') {
          return { output: ['evidence/'] };
        }

        const files = ['cipher.txt', 'riddle.txt'];
        if (stageOne) {
          files.push('stage1.txt');
        }
        if (stageTwo) {
          files.push('stage2.txt');
        }
        if (stageThree) {
          files.push('stage3.txt');
        }
        return { output: [files.join('    ')] };
      }

      if (cmd === 'cat') {
        if (args.length !== 1) {
          return { output: ['usage: cat <file>'] };
        }

        const file = resolveEvidenceFile(args[0]);

        if (!file) {
          return { output: [`cat: ${args[0]}: No such file or directory`] };
        }

        if (file === 'cipher.txt') {
          return { output: [encodedText] };
        }

        if (file === 'riddle.txt') {
          return { output: ['"First I was flipped, then I was rotated, then I was shifted."'] };
        }

        if (file === 'stage3.txt') {
          if (!stageThree) {
            return { output: ['cat: stage3.txt: No such file or directory'] };
          }
          return { output: [stageThree] };
        }

        return { output: [`cat: ${args[0]}: No such file or directory`] };
      }

      if (normalized === 'reverse cipher.txt') {
        const output = reverseText(encodedText);
        setStageOne(output);
        return { output: [output, '[saved] stage1.txt'] };
      }

      if (normalized === 'rot13 stage1.txt') {
        if (!stageOne) {
          return { output: ['stage1.txt not found. run: reverse cipher.txt'] };
        }

        const output = rot13(stageOne);
        setStageTwo(output);
        return { output: [output, '[saved] stage2.txt'] };
      }

      if (normalized === 'caesar stage2.txt -5') {
        if (!stageTwo) {
          return { output: ['stage2.txt not found. run: rot13 stage1.txt'] };
        }

        const output = caesarShift(stageTwo, -5);
        setStageThree(output);
        return { output: [output, '[saved] stage3.txt'] };
      }

      if (normalized === 'cat stage3.txt') {
        if (!stageThree) {
          return { output: ['stage3.txt not found. run: caesar stage2.txt -5'] };
        }
        return { output: [stageThree] };
      }

      if (cmd === 'reverse' || cmd === 'rot13' || cmd === 'caesar') {
        return {
          output: [
            `invalid syntax: ${shellCommand}`,
            'Expected:',
            'reverse cipher.txt',
            'rot13 stage1.txt',
            'caesar stage2.txt -5'
          ]
        };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [cwd, encodedText, stageOne, stageThree, stageTwo]
  );

  const handleValidate = () => {
    const matches =
      normalizeLower(answer) === normalizeLower(plainMessage) ||
      (normalizeLower(answer).includes(normalizeLower(challengeFlag)) &&
        normalizeLower(answer).includes('mission relay confirms flag'));

    setIsCorrect(matches);

    if (matches) {
      setFeedback('[ok] layered cipher fully reversed. transmission restored.');
      unlock();
      return;
    }

    setFeedback('[err] decode chain incomplete. verify reverse -> rot13 -> caesar -5 order.');
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// THE MULTI-CIPHER GAUNTLET" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            layered decode
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Decode the garbled passage in reverse order. Use the browser terminal to process each stage and recover the
          embedded flag sentence.
        </p>
      </div>

      <div className={panelClassName}>
        <p className="font-display text-[10px] uppercase tracking-[0.14em] text-neon-cyan">intercepted text</p>
        <p className="mt-2 break-all rounded border border-border-dim bg-bg-primary px-3 py-2 font-mono text-sm text-neon-green">
          {encodedText}
        </p>
      </div>

      <BrowserTerminal
        title="Cipher Workstation"
        endpoint="browser-terminal://cipher-lab"
        prompt="analyst@cipher:~$"
        introLines={['Connected to cipher-lab.', 'Type `help` for commands.', 'Hint: cd evidence']}
        onCommand={handleCommand}
      />

      <div className={panelClassName}>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          Decoded passage
        </label>
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          className="terminal-input min-h-[110px]"
          placeholder="Paste your fully decoded sentence"
        />
        <button type="button" onClick={handleValidate} className="btn-primary mt-3 w-full">
          VERIFY DECODE
        </button>
      </div>

      {feedback && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            isCorrect
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

function PixelSpyGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [cwd, setCwd] = useState('/home/analyst');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const [cmd, ...args] = tokens;
      const normalized = normalizeLower(command);
      const shellCommand = tokens.join(' ');

      if (normalized === 'help') {
        return {
          output: [
            'Commands:',
            'pwd',
            'cd <dir>',
            'ls',
            'download street_scene.jpg',
            'file street_scene.jpg',
            'steg decode street_scene.jpg',
            'clear'
          ]
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (cmd === 'pwd') {
        if (args.length > 0) {
          return { output: ['pwd: too many arguments'] };
        }

        return { output: [cwd] };
      }

      if (cmd === 'cd') {
        if (args.length !== 1) {
          return { output: ['usage: cd <directory>'] };
        }

        const target = args[0];
        const allowRoot = target === '~' || target === '/home/analyst' || target === '.';
        const allowUploads = target === 'uploads' || target === '/home/analyst/uploads';
        const allowDownloads = target === 'downloads' || target === '/home/analyst/downloads';
        const allowBack = target === '..';

        if (allowRoot || (allowBack && cwd !== '/home/analyst')) {
          setCwd('/home/analyst');
          return { output: [] };
        }

        if (allowUploads) {
          setCwd('/home/analyst/uploads');
          return { output: [] };
        }

        if (allowDownloads) {
          setCwd('/home/analyst/downloads');
          return { output: [] };
        }

        return { output: [`cd: no such file or directory: ${target}`] };
      }

      if (cmd === 'ls') {
        if (args.length > 1) {
          return { output: ['usage: ls [directory]'] };
        }

        if (cwd === '/home/analyst') {
          return { output: ['uploads/    downloads/    readme.txt'] };
        }

        if (cwd === '/home/analyst/uploads') {
          return { output: ['street_scene.jpg'] };
        }

        if (cwd === '/home/analyst/downloads') {
          return { output: [isDownloaded ? 'street_scene.jpg' : '(empty)'] };
        }
      }

      if (normalized === 'download street_scene.jpg') {
        if (cwd !== '/home/analyst/uploads') {
          return { output: ['download error: street_scene.jpg only exists in /home/analyst/uploads'] };
        }

        setIsDownloaded(true);
        return {
          output: [
            'Downloading street_scene.jpg...',
            '100% complete (2.4 MB)',
            'Saved to /home/analyst/downloads/street_scene.jpg'
          ]
        };
      }

      if (normalized === 'file street_scene.jpg') {
        if (cwd === '/home/analyst/downloads' && !isDownloaded) {
          return { output: ['file: cannot open street_scene.jpg (No such file or directory)'] };
        }

        if (cwd === '/home/analyst' || (cwd === '/home/analyst/downloads' && isDownloaded) || cwd === '/home/analyst/uploads') {
          return {
            output: ['street_scene.jpg: JPEG image data, 1920 x 1280, baseline, quality 92']
          };
        }

        return {
          output: ['file: cannot open street_scene.jpg (No such file or directory)']
        };
      }

      if (normalized === 'steg decode street_scene.jpg') {
        if (!isDownloaded) {
          return { output: ['decoder error: file not found in local sandbox. run download first.'] };
        }

        if (cwd !== '/home/analyst/downloads') {
          return { output: ['decoder error: run decode from /home/analyst/downloads after download.'] };
        }

        const payload = `Hidden payload: meetup clue recovered. flag => ${challengeFlag}`;
        setDecodedMessage(payload);
        setStatus('[ok] hidden payload extracted from image.');
        unlock();
        return {
          output: [
            'Launching stego decoder...',
            'LSB channel scan complete.',
            payload
          ]
        };
      }

      if (cmd === 'download' || cmd === 'file' || cmd === 'steg') {
        return {
          output: [
            `invalid syntax: ${shellCommand}`,
            'Expected:',
            'download street_scene.jpg',
            'file street_scene.jpg',
            'steg decode street_scene.jpg'
          ]
        };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [challengeFlag, cwd, isDownloaded, unlock]
  );

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// PIXEL SPY" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">steganography lab</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Download the image and run it through the decoder terminal. The hidden channel contains both clue text and the
          mission flag.
        </p>
      </div>

      <div className={panelClassName}>
        <div className="overflow-hidden rounded border border-border-dim">
          <div className="relative h-48 bg-[linear-gradient(135deg,#3e5a75_0%,#6f8fa7_48%,#9ab7c8_100%)]">
            <div className="absolute left-10 top-16 h-20 w-20 rounded bg-[rgba(15,20,32,0.55)]" />
            <div className="absolute right-14 top-12 h-28 w-24 rounded bg-[rgba(15,20,32,0.42)]" />
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-[rgba(24,39,55,0.75)]" />
          </div>
        </div>
        <p className="mt-2 text-xs text-text-secondary">`street_scene.jpg` uploaded by @field-observer</p>
      </div>

      <BrowserTerminal
        title="Stego Decoder"
        endpoint="browser-terminal://stego-toolkit"
        prompt="analyst@stego:~$"
        introLines={['Steganography toolkit online.', 'Run `help` to list commands.', 'Hint: cd uploads, then download the file.']}
        onCommand={handleCommand}
      />

      {status && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          {status}
        </p>
      )}

      {decodedMessage && (
        <p className="rounded border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] px-3 py-2 text-sm text-text-primary">
          {decodedMessage}
        </p>
      )}
    </div>
  );
}

const HASH_WORDLIST = [
  'apple',
  'orange',
  'banana',
  'grape',
  'mango',
  'school',
  'teacher',
  'student',
  'travel',
  'music',
  'winter',
  'summer',
  'rocket',
  'dragon',
  'shadow',
  'sunrise',
  'sunset',
  'coffee',
  'guitar',
  'camera',
  'friend',
  'puzzle',
  'secure',
  'network',
  'cipher',
  'packet',
  'river',
  'mountain',
  'silver',
  'gold',
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'one',
  'two',
  'three',
  'four',
  'seven',
  'nine'
] as const;

const HASH_TARGETS = [
  { id: 'hash-1', hash: 'bb3aec0fdcdbc2974890f805c585d432', word: 'seven', digit: '7' },
  { id: 'hash-2', hash: '8cbad96aced40b3838dd9f07f6ef5772', word: 'four', digit: '4' },
  { id: 'hash-3', hash: 'b8a9f715dbb64fd5c56e7783c6820a61', word: 'two', digit: '2' },
  { id: 'hash-4', hash: 'c785e1ed2950e3e36b1e2ca01f299a54', word: 'nine', digit: '9' }
] as const;

const HASH_LOOKUP: Record<(typeof HASH_WORDLIST)[number], string> = {
  apple: '1f3870be274f6c49b3e31a0c6728957f',
  orange: 'fe01d67a002dfa0f3ac084298142eccd',
  banana: '72b302bf297a228a75730123efef7c41',
  grape: 'b781cbb29054db12f88f08c6e161c199',
  mango: 'aa00faf97d042c13a59da4d27eb32358',
  school: '7516c3b35580b3490248629cff5e498c',
  teacher: '8d788385431273d11e8b43bb78f3aa41',
  student: 'cd73502828457d15655bbd7a63fb0bc8',
  travel: '69266c67e75c946ef9b4144b0554326d',
  music: '18d6769919266cd0bd6cd78aa405d5d0',
  winter: 'f6432274349b5cb93433f8ed886a3f37',
  summer: '6b1628b016dff46e6fa35684be6acc96',
  rocket: 'fdfedc01c66e9ea2817508ca1097df2f',
  dragon: '8621ffdbc5698829397d97767ac13db3',
  shadow: '3bf1114a986ba87ed28fc1b5884fc2f8',
  sunrise: 'feed5d47c860f422712ac902a89865db',
  sunset: '88eb60614bb67782bd8c18afb4438329',
  coffee: '24eb05d18318ac2db8b2b959315d10f2',
  guitar: '4c39e90d6a5c38a3f8a9b1f05840f240',
  camera: 'dd6d2dcc679d12b9430a9787bab45b33',
  friend: '3af00c6cad11f7ab5db4467b66ce503e',
  puzzle: '2d8aa42a0347c2d66cc86a0138dc9664',
  secure: '1c0b76fce779f78f51be339c49445c49',
  network: '91e02cd2b8621d0c05197f645668c5c4',
  cipher: '08406a6e18bdf83010ddd1187251454d',
  packet: '9c509e44db33400b9ffef2157ada8b5a',
  river: 'a5b03048ebe345c488e0ca30eff6ab0c',
  mountain: 'ec6d9c8953ab272295ec0469bbed59ab',
  silver: '97f014516561ef487ec368d6158eb3f4',
  gold: 'e07e81c20cf5935f5225765f0af81755',
  alpha: '2c1743a391305fbf367df8e4f069f9f9',
  bravo: 'fd9ab41e47a9ef4f6477a8a000bf404f',
  charlie: 'bf779e0933a882808585d19455cd7937',
  delta: '63bcabf86a9a991864777c631c5b7617',
  one: 'f97c5d29941bfb1b2fdab0874906ab82',
  two: 'b8a9f715dbb64fd5c56e7783c6820a61',
  three: '35d6d33467aae9a2e3dccb4b6b027878',
  four: '8cbad96aced40b3838dd9f07f6ef5772',
  seven: 'bb3aec0fdcdbc2974890f805c585d432',
  nine: 'c785e1ed2950e3e36b1e2ca01f299a54'
};

function HashCrackerShowdownGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const [cwd, setCwd] = useState('/home/analyst');
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [crackLog, setCrackLog] = useState<string[]>([]);
  const [digitAnswer, setDigitAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const [cmd, ...args] = tokens;
      const lowered = tokens.join(' ').toLowerCase();
      const shellCommand = tokens.join(' ');

      if (cmd === 'pwd') {
        if (args.length > 0) {
          return { output: ['pwd: too many arguments'] };
        }

        return { output: [cwd] };
      }

      if (cmd === 'cd') {
        if (args.length !== 1) {
          return { output: ['usage: cd <directory>'] };
        }

        const target = args[0];

        if (target === '~' || target === '/home/analyst' || target === '.') {
          setCwd('/home/analyst');
          return { output: [] };
        }

        if (target === 'hashes' || target === '/home/analyst/hashes') {
          setCwd('/home/analyst/hashes');
          return { output: [] };
        }

        if (target === 'wordlist' || target === '/home/analyst/wordlist') {
          setCwd('/home/analyst/wordlist');
          return { output: [] };
        }

        if (target === '..') {
          setCwd('/home/analyst');
          return { output: [] };
        }

        return { output: [`cd: no such file or directory: ${target}`] };
      }

      if (lowered === 'help') {
        return {
          output: [
            'Commands:',
            'pwd',
            'cd <dir>',
            'ls',
            'cat <file>',
            'targets',
            'wordlist',
            'md5 <word>',
            'clear'
          ]
        };
      }

      if (lowered === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (cmd === 'ls') {
        if (args.length > 1) {
          return { output: ['usage: ls [directory]'] };
        }

        if (cwd === '/home/analyst') {
          const base = ['hashes/', 'wordlist/', 'readme.txt'];
          if (crackLog.length > 0) {
            base.push('cracked.log');
          }
          return { output: [base.join('    ')] };
        }

        if (cwd === '/home/analyst/hashes') {
          return { output: ['target_hashes.txt'] };
        }

        if (cwd === '/home/analyst/wordlist') {
          return { output: ['words.txt'] };
        }
      }

      if (cmd === 'cat') {
        if (args.length !== 1) {
          return { output: ['usage: cat <file>'] };
        }

        const file = args[0];

        if (file === 'cracked.log' && cwd === '/home/analyst') {
          return { output: crackLog.length > 0 ? crackLog : ['[empty] no cracked hashes yet'] };
        }

        if (file === 'target_hashes.txt' && cwd === '/home/analyst/hashes') {
          return { output: HASH_TARGETS.map((target, index) => `${index + 1}. ${target.hash}`) };
        }

        if (file === 'words.txt' && cwd === '/home/analyst/wordlist') {
          const rows: string[] = [];
          for (let index = 0; index < HASH_WORDLIST.length; index += 5) {
            rows.push(HASH_WORDLIST.slice(index, index + 5).join('    '));
          }
          return { output: rows };
        }

        return { output: [`cat: ${file}: No such file or directory`] };
      }

      if (lowered === 'targets') {
        return {
          output: HASH_TARGETS.map((target, index) => `${index + 1}. ${target.hash}`)
        };
      }

      if (lowered === 'wordlist') {
        const rows: string[] = [];
        for (let index = 0; index < HASH_WORDLIST.length; index += 5) {
          rows.push(HASH_WORDLIST.slice(index, index + 5).join('    '));
        }
        return { output: rows };
      }

      if (cmd === 'md5') {
        if (args.length !== 1) {
          return { output: ['usage: md5 <word>'] };
        }

        const word = args[0].toLowerCase() as (typeof HASH_WORDLIST)[number];
        const digest = HASH_LOOKUP[word];

        if (!digest) {
          return { output: [`word not in challenge list: ${word}`] };
        }

        const target = HASH_TARGETS.find((item) => item.hash === digest);

        if (target) {
          setMatches((previous) => ({ ...previous, [target.hash]: word }));
          setCrackLog((previous) => {
            const line = `${target.hash} -> ${word}`;
            if (previous.includes(line)) {
              return previous;
            }
            return [...previous, line];
          });
          return { output: [`md5(${word}) = ${digest}`, `[match] target ${target.id} solved -> ${word}`] };
        }

        return { output: [`md5(${word}) = ${digest}`] };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [crackLog, cwd]
  );

  const handleValidate = () => {
    const expectedDigits = HASH_TARGETS.map((target) => target.digit).join('');
    const match = normalizeText(digitAnswer) === expectedDigits;
    setIsCorrect(match);

    if (match) {
      setFeedback('[ok] all hash matches converted to digits in sequence. showdown cleared.');
      unlock();
      return;
    }

    setFeedback('[err] digit sequence incorrect. ensure each matched word is converted in hash order.');
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// HASH CRACKER SHOWDOWN" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">md5 arena</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Hash words from the 40-word list. Four hashes map to number words. Convert those four words to digits and
          concatenate in order.
        </p>
      </div>

      <div className={panelClassName}>
        <p className="font-display text-[10px] uppercase tracking-[0.14em] text-neon-cyan">target hashes</p>
        <div className="mt-2 space-y-2">
          {HASH_TARGETS.map((target, index) => (
            <div key={target.id} className="rounded border border-border-dim bg-bg-primary px-3 py-2">
              <p className="font-mono text-xs text-neon-green">
                {index + 1}. {target.hash}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Status: {matches[target.hash] ? 'matched' : 'unmatched'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={panelClassName}>
        <p className="font-display text-[10px] uppercase tracking-[0.14em] text-neon-cyan">wordlist (40)</p>
        <p className="mt-2 text-xs leading-6 text-text-secondary">{HASH_WORDLIST.join(', ')}</p>
      </div>

      <BrowserTerminal
        title="MD5 Console"
        endpoint="browser-terminal://hash-toolkit"
        prompt="analyst@hashlab:~$"
        introLines={['Hash tool online.', 'Tip: run `targets`, then `md5 <word>`.', 'Use cd hashes | cd wordlist for files.']}
        onCommand={handleCommand}
      />

      <div className={panelClassName}>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          Enter 4-digit sequence
        </label>
        <input
          value={digitAnswer}
          onChange={(event) => setDigitAnswer(event.target.value)}
          className="terminal-input"
          placeholder="e.g. 1234"
          maxLength={4}
        />
        <button type="button" onClick={handleValidate} className="btn-primary mt-3 w-full">
          VERIFY DIGITS
        </button>
      </div>

      {feedback && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            isCorrect
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

function DnsRaceGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [cwd, setCwd] = useState('/home/analyst');
  const [queryLog, setQueryLog] = useState<string[]>([]);
  const [answers, setAnswers] = useState({
    aRecordIp: '',
    mxHost: '',
    cnameCount: '',
    ttl: '',
    txtValue: ''
  });
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const expected = {
    aRecordIp: '198.51.100.42',
    mxHost: 'mail.ctflab-academy.fake',
    cnameCount: '3',
    ttl: '300',
    txtValue: 'academy-lab=secure-channel-v3'
  };

  const handleCommand = useCallback((command: string): TerminalResult => {
    const tokens = tokenizeCommand(command);
    if (tokens.length === 0) {
      return { output: [] };
    }

    const [cmd, ...args] = tokens;
    const normalized = normalizeLower(command);
    const shellCommand = tokens.join(' ');

    if (cmd === 'pwd') {
      if (args.length > 0) {
        return { output: ['pwd: too many arguments'] };
      }
      return { output: [cwd] };
    }

    if (cmd === 'cd') {
      if (args.length !== 1) {
        return { output: ['usage: cd <directory>'] };
      }

      const target = args[0];
      if (target === '~' || target === '/home/analyst' || target === '.') {
        setCwd('/home/analyst');
        return { output: [] };
      }

      if (target === 'dns-cache' || target === '/home/analyst/dns-cache') {
        setCwd('/home/analyst/dns-cache');
        return { output: [] };
      }

      if (target === '..') {
        setCwd('/home/analyst');
        return { output: [] };
      }

      return { output: [`cd: no such file or directory: ${target}`] };
    }

    if (normalized === 'help') {
      return {
        output: [
          'Commands:',
          'pwd',
          'cd <dir>',
          'ls',
          'cat cache.log',
          'dig ctflab-academy.fake a',
          'dig ctflab-academy.fake mx',
          'dig ctflab-academy.fake cname',
          'dig ctflab-academy.fake txt',
          'clear'
        ]
      };
    }

    if (normalized === 'clear') {
      return { clear: true, output: ['[terminal cleared]'] };
    }

    if (cmd === 'ls') {
      if (args.length > 1) {
        return { output: ['usage: ls [directory]'] };
      }

      if (cwd === '/home/analyst') {
        return { output: ['dns-cache/    briefing.txt'] };
      }

      if (cwd === '/home/analyst/dns-cache') {
        return { output: ['cache.log'] };
      }
    }

    if (cmd === 'cat') {
      if (args.length !== 1) {
        return { output: ['usage: cat <file>'] };
      }

      const target = args[0];
      if (target === 'cache.log' && cwd === '/home/analyst/dns-cache') {
        return { output: queryLog.length > 0 ? queryLog : ['[empty] no DNS queries executed yet'] };
      }

      return { output: [`cat: ${target}: No such file or directory`] };
    }

    if (normalized === 'dig ctflab-academy.fake a') {
      setQueryLog((previous) => [...previous, 'A -> 198.51.100.42 ttl=300']);
      return {
        output: [
          ';; QUESTION SECTION:',
          ';ctflab-academy.fake.    IN    A',
          ';; ANSWER SECTION:',
          'ctflab-academy.fake. 300 IN A 198.51.100.42'
        ]
      };
    }

    if (normalized === 'dig ctflab-academy.fake mx') {
      setQueryLog((previous) => [...previous, 'MX -> mail.ctflab-academy.fake priority=10']);
      return {
        output: [
          ';; QUESTION SECTION:',
          ';ctflab-academy.fake.    IN    MX',
          ';; ANSWER SECTION:',
          'ctflab-academy.fake. 300 IN MX 10 mail.ctflab-academy.fake.'
        ]
      };
    }

    if (normalized === 'dig ctflab-academy.fake cname') {
      setQueryLog((previous) => [...previous, 'CNAME -> 3 aliases returned']);
      return {
        output: [
          ';; ANSWER SECTION:',
          'www.ctflab-academy.fake. 300 IN CNAME edge.ctflab-academy.fake.',
          'portal.ctflab-academy.fake. 300 IN CNAME app-gw.ctflab-academy.fake.',
          'status.ctflab-academy.fake. 300 IN CNAME uptime.ctflab-academy.fake.'
        ]
      };
    }

    if (normalized === 'dig ctflab-academy.fake txt') {
      setQueryLog((previous) => [...previous, 'TXT -> academy-lab=secure-channel-v3']);
      return {
        output: [
          ';; ANSWER SECTION:',
          'ctflab-academy.fake. 300 IN TXT "academy-lab=secure-channel-v3"'
        ]
      };
    }

    if (cmd === 'dig') {
      return { output: ['usage: dig ctflab-academy.fake <a|mx|cname|txt>'] };
    }

    return { output: [shellCommandNotFound(shellCommand)] };
  }, [cwd, queryLog]);

  const handleValidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const match =
      normalizeLower(answers.aRecordIp) === expected.aRecordIp &&
      normalizeLower(answers.mxHost).replace(/\.$/, '') === expected.mxHost &&
      normalizeText(answers.cnameCount) === expected.cnameCount &&
      normalizeText(answers.ttl) === expected.ttl &&
      normalizeLower(answers.txtValue).replace(/"/g, '') === expected.txtValue;

    setIsCorrect(match);

    if (match) {
      setFeedback('[ok] all five dns answers verified. resolver race complete.');
      unlock();
      return;
    }

    setFeedback('[err] at least one answer is incorrect. re-run dig queries and verify exact values.');
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// DNS RACE" accent="cyan" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            domain: ctflab-academy.fake
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Use the simulated DNS terminal and answer all five reconnaissance questions correctly.
        </p>
      </div>

      <BrowserTerminal
        title="DNS Lookup Tool"
        endpoint="browser-terminal://dns-sim"
        prompt="analyst@dns:~$"
        introLines={['DNS simulation ready.', 'Query domain: ctflab-academy.fake', 'cache log path: /home/analyst/dns-cache/cache.log']}
        onCommand={handleCommand}
      />

      <form onSubmit={handleValidate} className="grid gap-3 md:grid-cols-2">
        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            A record IP address
          </span>
          <input
            value={answers.aRecordIp}
            onChange={(event) => setAnswers((prev) => ({ ...prev, aRecordIp: event.target.value }))}
            className="terminal-input"
            placeholder="x.x.x.x"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            MX record hostname
          </span>
          <input
            value={answers.mxHost}
            onChange={(event) => setAnswers((prev) => ({ ...prev, mxHost: event.target.value }))}
            className="terminal-input"
            placeholder="mail.example.fake"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            Number of CNAME records
          </span>
          <input
            value={answers.cnameCount}
            onChange={(event) => setAnswers((prev) => ({ ...prev, cnameCount: event.target.value }))}
            className="terminal-input"
            placeholder="0"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            TTL of A record
          </span>
          <input
            value={answers.ttl}
            onChange={(event) => setAnswers((prev) => ({ ...prev, ttl: event.target.value }))}
            className="terminal-input"
            placeholder="seconds"
          />
        </label>

        <label className={`${panelClassName} md:col-span-2`}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            TXT record value
          </span>
          <input
            value={answers.txtValue}
            onChange={(event) => setAnswers((prev) => ({ ...prev, txtValue: event.target.value }))}
            className="terminal-input"
            placeholder='example: "key=value"'
          />
        </label>

        <button type="submit" className="btn-primary md:col-span-2">
          SUBMIT DNS ANSWERS
        </button>
      </form>

      {feedback && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            isCorrect
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

function EncryptedTransmissionBossGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [cwd, setCwd] = useState('/home/analyst');
  const [stageOne, setStageOne] = useState<string | null>(null);
  const [firstHalf, setFirstHalf] = useState<string | null>(null);
  const [secondHalf, setSecondHalf] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const qrCells = useMemo(() => {
    return Array.from({ length: 121 }, (_, index) => ((index * 17 + 11) % 9 < 4 ? 1 : 0));
  }, []);

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const [cmd, ...args] = tokens;
      const normalized = normalizeLower(command);
      const shellCommand = tokens.join(' ');

      if (normalized === 'help') {
        return {
          output: [
            'Commands:',
            'pwd',
            'cd <dir>',
            'ls',
            'cat notes.txt',
            'cat intercept.hex',
            'xxd -r -p intercept.hex',
            'base64 -d stage1.txt',
            'cat stage2.txt',
            'clear'
          ]
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (cmd === 'pwd') {
        if (args.length > 0) {
          return { output: ['pwd: too many arguments'] };
        }
        return { output: [cwd] };
      }

      if (cmd === 'cd') {
        if (args.length !== 1) {
          return { output: ['usage: cd <directory>'] };
        }

        const target = args[0];
        if (target === '~' || target === '/home/analyst' || target === '.') {
          setCwd('/home/analyst');
          return { output: [] };
        }

        if (target === 'capture' || target === '/home/analyst/capture') {
          setCwd('/home/analyst/capture');
          return { output: [] };
        }

        if (target === '..') {
          setCwd('/home/analyst');
          return { output: [] };
        }

        return { output: [`cd: no such file or directory: ${target}`] };
      }

      if (cmd === 'ls') {
        if (args.length > 1) {
          return { output: ['usage: ls [directory]'] };
        }

        if (cwd === '/home/analyst') {
          return { output: ['capture/    qr-node.png    notes.txt'] };
        }

        if (cwd !== '/home/analyst/capture') {
          return { output: ['ls: cannot access current directory'] };
        }

        const files = ['intercept.hex', 'qr-node.png', 'notes.txt'];
        if (stageOne) {
          files.push('stage1.txt');
        }
        if (firstHalf) {
          files.push('stage2.txt');
        }
        return { output: [files.join('    ')] };
      }

      if (cmd === 'cat' && args.length === 1 && args[0] === 'notes.txt') {
        return {
          output: [
            'Ops note:',
            '1) Convert intercept.hex to ASCII',
            '2) Decode resulting Base64',
            '3) Scan QR for second segment'
          ]
        };
      }

      if (normalized === 'cat intercept.hex') {
        if (cwd !== '/home/analyst/capture') {
          return { output: ['cat: intercept.hex: No such file or directory'] };
        }
        return {
          output: ['52 6b 78 42 52 33 74 55 55 6b 46 4f 55 30 31 4a 55 31 4e 4a 54 30 35 66']
        };
      }

      if (normalized === 'xxd -r -p intercept.hex') {
        if (cwd !== '/home/analyst/capture') {
          return { output: ['xxd: intercept.hex: No such file or directory'] };
        }

        const b64 = 'RkxBR3tUUkFOU01JU1NJT05f';
        setStageOne(b64);
        return { output: [b64, '[saved] stage1.txt'] };
      }

      if (normalized === 'base64 -d stage1.txt') {
        if (cwd !== '/home/analyst/capture') {
          return { output: ['base64: stage1.txt: No such file or directory'] };
        }

        if (!stageOne) {
          return { output: ['stage1.txt not found. run: xxd -r -p intercept.hex'] };
        }

        const decoded = 'FLAG{TRANSMISSION_';
        setFirstHalf(decoded);
        return { output: [decoded, '[saved] stage2.txt'] };
      }

      if (normalized === 'cat stage2.txt') {
        if (cwd !== '/home/analyst/capture') {
          return { output: ['cat: stage2.txt: No such file or directory'] };
        }

        if (!firstHalf) {
          return { output: ['stage2.txt not found. run: base64 -d stage1.txt'] };
        }
        return { output: [firstHalf] };
      }

      if (cmd === 'cat') {
        return { output: ['usage: cat <notes.txt|intercept.hex|stage2.txt>'] };
      }

      if (cmd === 'xxd') {
        return { output: ['usage: xxd -r -p intercept.hex'] };
      }

      if (cmd === 'base64') {
        return { output: ['usage: base64 -d stage1.txt'] };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [cwd, firstHalf, stageOne]
  );

  const handleScanQr = () => {
    setSecondHalf('DECRYPTED}');
  };

  const handleValidate = () => {
    const match = normalizeText(answer) === challengeFlag;
    setIsCorrect(match);

    if (match) {
      setFeedback('[ok] boss payload reconstructed. encrypted transmission neutralized.');
      unlock();
      return;
    }

    setFeedback('[err] final flag mismatch. confirm half order and braces.');
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// THE ENCRYPTED TRANSMISSION" accent="orange" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-alert-orange">boss challenge</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Decode the intercepted hex stream, convert the resulting Base64, scan the embedded QR code, and combine both
          halves in the correct order.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <BrowserTerminal
          title="Traffic Decoder"
          endpoint="browser-terminal://boss-netlog"
          prompt="analyst@boss:~$"
          introLines={['Interception workspace ready.', 'Run `help` for decode chain commands.', 'Hint: cd capture']}
          onCommand={handleCommand}
        />

        <div className={panelClassName}>
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-neon-cyan">qr node</p>
          <div className="mt-3 grid w-full grid-cols-11 gap-[2px] rounded border border-border-dim bg-bg-primary p-3">
            {qrCells.map((cell, index) => (
              <span
                key={index}
                className={`aspect-square rounded-[1px] ${cell ? 'bg-text-primary' : 'bg-bg-surface-2'}`}
              />
            ))}
          </div>
          <button type="button" onClick={handleScanQr} className="btn-secondary mt-3 w-full">
            SCAN QR CODE
          </button>
          {secondHalf && (
            <p className="mt-3 rounded border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] px-3 py-2 font-mono text-xs text-neon-cyan">
              QR payload: {secondHalf}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className={panelClassName}>
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">first half</p>
          <p className="mt-2 min-h-8 rounded border border-border-dim bg-bg-primary px-3 py-2 font-mono text-sm text-neon-green">
            {firstHalf ?? 'locked'}
          </p>
        </div>
        <div className={panelClassName}>
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">second half</p>
          <p className="mt-2 min-h-8 rounded border border-border-dim bg-bg-primary px-3 py-2 font-mono text-sm text-neon-green">
            {secondHalf ?? 'locked'}
          </p>
        </div>
      </div>

      <div className={panelClassName}>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">
          Combined final flag
        </label>
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          className="terminal-input"
          placeholder="FLAG{...}"
        />
        <button type="button" onClick={handleValidate} className="btn-primary mt-3 w-full">
          VERIFY FINAL FLAG
        </button>
      </div>

      {feedback && (
        <p
          className={`rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
            isCorrect
              ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
              : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

export function Week3ActivityExperience({
  activityId,
  challengeFlag,
  onFlagDiscovered
}: Week3ActivityExperienceProps) {
  const renderChallenge = () => {
    if (activityId === 'ip-detective') {
      return <IpDetectiveGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'view-source-treasure-hunt') {
      return <ViewSourceTreasureHuntGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'multi-cipher-gauntlet') {
      return <MultiCipherGauntletGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'pixel-spy') {
      return <PixelSpyGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'hash-cracker-showdown') {
      return <HashCrackerShowdownGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'dns-race') {
      return <DnsRaceGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'encrypted-transmission') {
      return <EncryptedTransmissionBossGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    return <Week3MissionUnavailable activityId={activityId} />;
  };

  return <Week3ChallengeShell>{renderChallenge()}</Week3ChallengeShell>;
}
