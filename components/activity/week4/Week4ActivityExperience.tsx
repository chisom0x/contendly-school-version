'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { TerminalCursor } from '@/components/shared/TerminalCursor';

interface Week4ActivityExperienceProps {
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

function tokenizeCommand(command: string) {
  return normalizeText(command).split(' ').filter(Boolean);
}

function shellCommandNotFound(command: string) {
  return `bash: ${command}: command not found`;
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
  prompt = 'agent@lab:~$',
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
        terminal hint: use up/down arrows for command history
      </p>
    </div>
  );
}

function Week4ChallengeShell({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="rounded border border-[rgba(39,201,63,0.22)] bg-[linear-gradient(180deg,rgba(10,14,24,0.96),rgba(13,20,34,0.98))] p-4 shadow-[0_0_0_1px_rgba(39,201,63,0.08),0_16px_30px_rgba(0,0,0,0.3)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// WEEK 4: GRAND FINAL LAB" accent="green" />
          <p className="flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.14em] text-neon-green">
            kid@defender:~$ week4 --launch
            <TerminalCursor className="h-[10px] w-[6px] bg-neon-green" />
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

function Week4MissionUnavailable({ activityId }: { activityId: string }) {
  return (
    <div className={panelClassName}>
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-alert-orange">
        {'// SIMULATOR MODULE NOT LOADED'}
      </p>
      <p className="mt-2 text-sm text-text-secondary">No dedicated week 4 experience is mapped to {activityId}.</p>
    </div>
  );
}

function HiddenFileHeistGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [cwd, setCwd] = useState('/home/agent');
  const [status, setStatus] = useState('');
  const hiddenFilePath = '/home/agent/intel/.shadow/.classified-ledger.txt';

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
        if (target === '~' || target === '.' || target === '/home/agent') {
          return '/home/agent';
        }

        if (target === '/home/agent/documents' || target === 'documents') {
          return '/home/agent/documents';
        }

        if (target === '/home/agent/intel' || target === 'intel') {
          return '/home/agent/intel';
        }

        if (target === '/home/agent/intel/.shadow' || target === '.shadow') {
          return '/home/agent/intel/.shadow';
        }

        if (target === '..') {
          if (cwd === '/home/agent/intel/.shadow') {
            return '/home/agent/intel';
          }
          if (cwd === '/home/agent/intel' || cwd === '/home/agent/documents') {
            return '/home/agent';
          }
          return '/home/agent';
        }

        return null;
      };

      const resolveFile = (value: string) => {
        if (value === hiddenFilePath || value === './.classified-ledger.txt') {
          return hiddenFilePath;
        }

        if (value === '.classified-ledger.txt' && cwd === '/home/agent/intel/.shadow') {
          return hiddenFilePath;
        }

        if (value === '/home/agent/briefing.txt' || (cwd === '/home/agent' && value === 'briefing.txt')) {
          return '/home/agent/briefing.txt';
        }

        return null;
      };

      if (normalized === 'help') {
        return {
          output: ['Commands:', 'pwd', 'ls', 'ls -la', 'cd <directory>', 'find <path> -name <pattern> -type f', 'cat <file>', 'clear']
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (cmd === 'pwd') {
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
        const showAll = args.some((item) => item.includes('a'));
        const paths = args.filter((item) => !item.startsWith('-'));
        if (paths.length > 1) {
          return { output: ['usage: ls [-la] [directory]'] };
        }

        const target = paths[0] ? resolveDir(paths[0]) : cwd;
        if (!target) {
          return { output: [`ls: cannot access '${paths[0]}': No such file or directory`] };
        }

        if (target === '/home/agent') {
          if (showAll) {
            return { output: ['.    ..    .cache/    briefing.txt    documents/    intel/'] };
          }
          return { output: ['briefing.txt    documents/    intel/'] };
        }

        if (target === '/home/agent/documents') {
          if (showAll) {
            return { output: ['.    ..    report.txt'] };
          }
          return { output: ['report.txt'] };
        }

        if (target === '/home/agent/intel') {
          if (showAll) {
            return { output: ['.    ..    .shadow/    note.txt'] };
          }
          return { output: ['note.txt'] };
        }

        if (target === '/home/agent/intel/.shadow') {
          if (showAll) {
            return { output: ['.    ..    .classified-ledger.txt'] };
          }
          return { output: [] };
        }
      }

      if (cmd === 'find') {
        if (
          normalized.includes('find /home/agent') &&
          normalized.includes('classified') &&
          normalized.includes('-type f')
        ) {
          return { output: [hiddenFilePath] };
        }

        return { output: ['find: no files matched that query'] };
      }

      if (cmd === 'cat') {
        if (args.length !== 1) {
          return { output: ['usage: cat <file>'] };
        }

        const file = resolveFile(args[0]);
        if (!file) {
          return { output: [`cat: ${args[0]}: No such file or directory`] };
        }

        if (file === '/home/agent/briefing.txt') {
          return {
            output: [
              'briefing: locate hidden evidence in /home/agent.',
              "hint: combine 'ls -la' + 'find /home/agent -name '.*classified*' -type f'."
            ]
          };
        }

        setStatus('[ok] hidden classified file recovered.');
        unlock();
        return {
          output: [
            `classified payload: ${challengeFlag}`,
            'exfil channel disabled.'
          ]
        };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [challengeFlag, cwd, unlock]
  );

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// THE HIDDEN FILE HEIST" accent="green" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">linux / files</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          An operative hid a dotfile containing &quot;classified&quot; somewhere in `/home/agent/`. Use `ls -la`, `find`,
          and `cat` to recover the flag.
        </p>
      </div>

      <BrowserTerminal
        title="Week4 File Heist"
        endpoint="browser-terminal://week4/hidden-file-heist"
        prompt="agent@lab:~$"
        introLines={[
          'Connected to shell lab.',
          'mission: recover hidden file in /home/agent',
          'run `help` for available commands.'
        ]}
        onCommand={handleCommand}
      />

      {status && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          {status}
        </p>
      )}
    </div>
  );
}

function PermissionImpossibleGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [mode, setMode] = useState<'200' | '100' | '600'>('200');
  const [status, setStatus] = useState('');

  const canRead = mode === '600';
  const permissionLabel = mode === '200' ? '-w-------' : mode === '100' ? '--x------' : '-rw------';

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const [cmd, ...args] = tokens;
      const normalized = normalizeLower(command);
      const shellCommand = tokens.join(' ');
      const targetPath = '/mission/vault/eyes-only.txt';

      if (normalized === 'help') {
        return {
          output: ['Commands:', 'ls -la /mission/vault', 'cat /mission/vault/eyes-only.txt', 'chmod <mode> /mission/vault/eyes-only.txt', 'clear']
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (cmd === 'ls') {
        if (!(normalized === 'ls -la /mission/vault' || normalized === 'ls -la' || normalized === 'ls /mission/vault')) {
          return { output: ['usage: ls -la /mission/vault'] };
        }

        return {
          output: [
            'total 4',
            'drwx------ 2 agent mission 4096 Apr 17 09:30 .',
            'drwxr-xr-x 4 root root 4096 Apr 17 09:28 ..',
            `${permissionLabel} 1 agent mission 128 Apr 17 09:31 eyes-only.txt`
          ]
        };
      }

      if (cmd === 'cat') {
        if (args.length !== 1) {
          return { output: ['usage: cat /mission/vault/eyes-only.txt'] };
        }

        const path = args[0];
        const isTarget = path === targetPath || path === 'eyes-only.txt';
        if (!isTarget) {
          return { output: [`cat: ${path}: No such file or directory`] };
        }

        if (!canRead) {
          if (mode === '100') {
            return {
              output: ['cat: /mission/vault/eyes-only.txt: Permission denied (execute bit set, read bit still missing)']
            };
          }

          return { output: ['cat: /mission/vault/eyes-only.txt: Permission denied'] };
        }

        setStatus('[ok] permissions fixed and classified document read.');
        unlock();
        return {
          output: [
            `eyes-only memo: ${challengeFlag}`,
            'audit note: least privilege restored.'
          ]
        };
      }

      if (cmd === 'chmod') {
        if (args.length < 2) {
          return { output: ['usage: chmod <mode> /mission/vault/eyes-only.txt'] };
        }

        const path = args[args.length - 1];
        const chmodMode = args.slice(0, -1).join(' ');
        if (!(path === targetPath || path === 'eyes-only.txt')) {
          return { output: [`chmod: cannot access '${path}': No such file or directory`] };
        }

        if (chmodMode === 'u+r' || chmodMode === '+r' || chmodMode === '600' || chmodMode === '400') {
          setMode('600');
          return { output: ['chmod: read permission granted to current user.'] };
        }

        if (chmodMode === '+x' || chmodMode === 'u+x' || chmodMode === '100') {
          setMode('100');
          return {
            output: ['chmod: mode updated, but read access is still not granted. try inspecting permission bits again.']
          };
        }

        return {
          output: ['chmod: mode applied, but mission still expects user read access on the file.']
        };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [canRead, mode, unlock, challengeFlag, permissionLabel]
  );

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// PERMISSION IMPOSSIBLE" accent="green" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">linux / permissions</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          `cat /mission/vault/eyes-only.txt` returns permission denied. Inspect `ls -la /mission/vault/`, choose the
          right `chmod`, then read the file.
        </p>
      </div>

      <BrowserTerminal
        title="Week4 Permission Lab"
        endpoint="browser-terminal://week4/permission-impossible"
        prompt="agent@lab:~$"
        introLines={['mission: recover /mission/vault/eyes-only.txt', 'run `help` if you get stuck.']}
        onCommand={handleCommand}
      />

      {status && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          {status}
        </p>
      )}
    </div>
  );
}

function LogHoundGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [answers, setAnswers] = useState({
    notFoundCount: '',
    topIp: '',
    firstCriticalTime: '',
    uniqueUsers: ''
  });
  const [queryUsage, setQueryUsage] = useState({ usedGrep: false, usedPipe: false, usedWc: false });
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const expected = {
    notFoundCount: '87',
    topIp: '10.24.7.9',
    firstCriticalTime: '02:14:55',
    uniqueUsers: '14'
  };

  const handleCommand = useCallback((command: string): TerminalResult => {
    const tokens = tokenizeCommand(command);
    if (tokens.length === 0) {
      return { output: [] };
    }

    const [cmd] = tokens;
    const normalized = normalizeLower(command);
    const shellCommand = tokens.join(' ');

    setQueryUsage((previous) => ({
      usedGrep: previous.usedGrep || normalized.includes('grep'),
      usedPipe: previous.usedPipe || command.includes('|'),
      usedWc: previous.usedWc || normalized.includes('wc')
    }));

    if (normalized === 'help') {
      return {
        output: [
          'Commands:',
          'ls /var/log/academy',
          'wc -l /var/log/academy/server.log',
          'grep ... /var/log/academy/server.log',
          'clear',
          'hint: mission expects grep + pipes + wc usage'
        ]
      };
    }

    if (normalized === 'clear') {
      return { clear: true, output: ['[terminal cleared]'] };
    }

    if (normalized === 'ls /var/log/academy' || normalized === 'ls /var/log/academy/') {
      return { output: ['server.log'] };
    }

    if (normalized === 'wc -l /var/log/academy/server.log') {
      return { output: ['600 /var/log/academy/server.log'] };
    }

    if (cmd === 'cat' && normalized.includes('/var/log/academy/server.log')) {
      return {
        output: [
          'server.log (600 lines) is large.',
          'use grep + pipes to extract: 404 count, top requester IP, first CRITICAL timestamp, unique usernames.'
        ]
      };
    }

    if (normalized.includes('grep') && normalized.includes('404') && normalized.includes('server.log')) {
      if (normalized.includes('| wc -l') || normalized.includes('grep -c')) {
        return { output: ['87'] };
      }

      return {
        output: [
          '10.24.7.9 - - [02:03:12] "GET /hidden" 404 512',
          '10.24.7.9 - - [02:03:35] "GET /backup" 404 512',
          '... (84 more matches)'
        ]
      };
    }

    if (normalized.includes('critical') && normalized.includes('server.log')) {
      if (normalized.includes('head -1')) {
        return { output: ['02:14:55 CRITICAL auth: repeated sudo elevation by user=ghost'] };
      }

      return {
        output: [
          '02:14:55 CRITICAL auth: repeated sudo elevation by user=ghost',
          '02:29:44 CRITICAL api: token replay detected from ip=10.24.7.9'
        ]
      };
    }

    if (
      normalized.includes('server.log') &&
      normalized.includes('uniq -c') &&
      normalized.includes('sort -nr') &&
      normalized.includes('head')
    ) {
      return { output: ['136 10.24.7.9'] };
    }

    if (
      normalized.includes('server.log') &&
      normalized.includes('user=') &&
      normalized.includes('sort -u') &&
      normalized.includes('wc -l')
    ) {
      return { output: ['14'] };
    }

    return { output: [shellCommandNotFound(shellCommand)] };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!queryUsage.usedGrep || !queryUsage.usedPipe || !queryUsage.usedWc) {
      setIsCorrect(false);
      setFeedback('[err] use grep, at least one pipe, and wc in terminal before submitting.');
      return;
    }

    const notFoundCountCorrect = normalizeText(answers.notFoundCount) === expected.notFoundCount;
    const topIpCorrect = normalizeText(answers.topIp) === expected.topIp;
    const criticalCorrect = normalizeText(answers.firstCriticalTime) === expected.firstCriticalTime;
    const usersCorrect = normalizeText(answers.uniqueUsers) === expected.uniqueUsers;

    const match = notFoundCountCorrect && topIpCorrect && criticalCorrect && usersCorrect;
    setIsCorrect(match);

    if (match) {
      setFeedback('[ok] log answers verified. concatenation complete and flag unlocked.');
      unlock();
      return;
    }

    const score = [notFoundCountCorrect, topIpCorrect, criticalCorrect, usersCorrect].filter(Boolean).length;
    setFeedback(`[err] ${score}/4 answers correct. verify the extracted values from server.log.`);
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// LOG HOUND" accent="green" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">linux / forensics</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Analyze `/var/log/academy/server.log` (600 lines) and answer all four questions. Use `grep`, pipes, and `wc` in
          your command flow before submission.
        </p>
      </div>

      <BrowserTerminal
        title="Week4 Log Console"
        endpoint="browser-terminal://week4/log-hound"
        prompt="analyst@forensics:~$"
        introLines={['forensics target: /var/log/academy/server.log', 'run `help` for mission format.']}
        onCommand={handleCommand}
      />

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            404 count
          </span>
          <input
            value={answers.notFoundCount}
            onChange={(event) => setAnswers((prev) => ({ ...prev, notFoundCount: event.target.value }))}
            className="terminal-input"
            placeholder="number"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            Top requester IP
          </span>
          <input
            value={answers.topIp}
            onChange={(event) => setAnswers((prev) => ({ ...prev, topIp: event.target.value }))}
            className="terminal-input"
            placeholder="x.x.x.x"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            First CRITICAL time
          </span>
          <input
            value={answers.firstCriticalTime}
            onChange={(event) => setAnswers((prev) => ({ ...prev, firstCriticalTime: event.target.value }))}
            className="terminal-input"
            placeholder="HH:MM:SS"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            Unique usernames
          </span>
          <input
            value={answers.uniqueUsers}
            onChange={(event) => setAnswers((prev) => ({ ...prev, uniqueUsers: event.target.value }))}
            className="terminal-input"
            placeholder="number"
          />
        </label>

        <button type="submit" className="btn-primary md:col-span-2">
          VERIFY LOG ANSWERS
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

function EncodedScriptGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [status, setStatus] = useState('');
  const [decodedLine, setDecodedLine] = useState<string | null>(null);

  const decodedSentence = useMemo(
    () => `Launcher decode success. Mission flag recovered: ${challengeFlag}`,
    [challengeFlag]
  );
  const encodedPayload = useMemo(() => btoa(decodedSentence), [decodedSentence]);

  const scriptContent = useMemo(
    () => [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      '',
      '# startup: warming launcher modules',
      `# payload: ${encodedPayload}`,
      'echo "launcher ready"'
    ],
    [encodedPayload]
  );

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const [cmd] = tokens;
      const normalized = normalizeLower(command);
      const shellCommand = tokens.join(' ');

      if (normalized === 'help') {
        return {
          output: [
            'Commands:',
            'ls /scripts',
            'cat /scripts/launcher.sh',
            'echo <base64-string> | base64 -d',
            'clear'
          ]
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (normalized === 'ls /scripts' || normalized === 'ls /scripts/') {
        return { output: ['launcher.sh'] };
      }

      if (normalized === 'cat /scripts/launcher.sh' || normalized === 'cat launcher.sh') {
        return { output: scriptContent };
      }

      const decodeMatch = command.match(/^echo\s+(.+)\s*\|\s*base64\s+-d\s*$/);
      if (decodeMatch) {
        let candidate = decodeMatch[1].trim();

        if (
          (candidate.startsWith('"') && candidate.endsWith('"')) ||
          (candidate.startsWith("'") && candidate.endsWith("'"))
        ) {
          candidate = candidate.slice(1, -1);
        }

        if (candidate === encodedPayload) {
          setDecodedLine(decodedSentence);
          setStatus('[ok] base64 payload decoded from launcher script.');
          unlock();
          return { output: [decodedSentence] };
        }

        try {
          const decoded = atob(candidate);
          return { output: [decoded] };
        } catch (_error) {
          return { output: ['base64: invalid input'] };
        }
      }

      if (cmd === 'echo' && normalized.includes('base64')) {
        return { output: ['usage: echo <base64-string> | base64 -d'] };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [encodedPayload, decodedSentence, scriptContent, unlock]
  );

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// THE ENCODED SCRIPT" accent="green" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">linux / decode</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Read `/scripts/launcher.sh`, extract the Base64 string from the comment line, then decode it with
          `echo [string] | base64 -d`.
        </p>
      </div>

      <BrowserTerminal
        title="Week4 Decode Shell"
        endpoint="browser-terminal://week4/encoded-script"
        prompt="agent@decode:~$"
        introLines={['target script: /scripts/launcher.sh', 'decode the hidden payload comment to recover the flag.']}
        onCommand={handleCommand}
      />

      {status && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          {status}
        </p>
      )}

      {decodedLine && (
        <p className="rounded border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] px-3 py-2 text-sm text-text-primary">
          {decodedLine}
        </p>
      )}
    </div>
  );
}

function NetworkReconMissionGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const [status, setStatus] = useState('');
  const host = '172.30.44.19';

  const endpointChain = useMemo<Record<string, string>>(
    () => ({
      '/start': 'Mission initialized. Next endpoint: /probe-alpha',
      '/probe-alpha': 'Good trace. Next endpoint: /relay-bravo',
      '/relay-bravo': 'Signal acquired. Next endpoint: /bridge-charlie',
      '/bridge-charlie': 'Almost there. Next endpoint: /vault-delta',
      '/vault-delta': 'Final hop unlocked. Next endpoint: /final-eclipse',
      '/final-eclipse': `flag recovered: ${challengeFlag}`
    }),
    [challengeFlag]
  );

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const normalized = normalizeLower(command);
      const shellCommand = tokens.join(' ');

      if (normalized === 'help') {
        return {
          output: ['Commands:', `curl http://${host}/start`, 'curl http://<lab-ip>/<endpoint>', 'clear']
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      const curlMatch = command.match(/^curl\s+http:\/\/([^/\s]+)(\/[^\s]*)\s*$/);
      if (curlMatch) {
        const requestHost = curlMatch[1];
        const endpoint = curlMatch[2];

        if (requestHost !== host) {
          return { output: [`curl: (7) failed to connect to ${requestHost} port 80: Connection refused`] };
        }

        const response = endpointChain[endpoint];
        if (!response) {
          return { output: ['404 route not found. read previous clue and retry the exact endpoint.'] };
        }

        if (endpoint === '/final-eclipse') {
          setStatus('[ok] endpoint chain complete across all mission hops.');
          unlock();
        }

        return { output: [response] };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [endpointChain, host, unlock]
  );

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// NETWORK RECON MISSION" accent="green" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">linux / networking</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Start with `curl http://{host}/start` and follow the clue chain through each endpoint until the final flag
          response.
        </p>
      </div>

      <BrowserTerminal
        title="Week4 Recon Shell"
        endpoint="browser-terminal://week4/network-recon"
        prompt="agent@net:~$"
        introLines={['lab network target online.', `mission start: curl http://${host}/start`]}
        onCommand={handleCommand}
      />

      {status && (
        <p className="rounded border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] text-neon-green">
          {status}
        </p>
      )}
    </div>
  );
}

function UserHunterGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);
  const rogueUser = 'syncshadow';
  const rogueLoginIp = '185.77.19.44';
  const passwdLines = useMemo(
    () => [
      'root:x:0:0:root:/root:/bin/bash',
      'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
      'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
      'syslog:x:104:110::/home/syslog:/usr/sbin/nologin',
      'operator:x:1001:1001:Operator:/home/operator:/bin/bash',
      'maintbot:x:1002:1002:Maintenance Bot:/home/maintbot:/bin/bash',
      'syncshadow:x:1337:1337:syncshadow:/home/syncshadow:/bin/bash',
      'student:x:1003:1003:Student:/home/student:/bin/bash'
    ],
    []
  );
  const rogueFiles = useMemo(
    () => ['/opt/.cache/.syncshadow/session-note.txt', '/var/tmp/.ssh-shadow/mission-flag.txt'],
    []
  );

  const [report, setReport] = useState({
    username: '',
    loginSource: '',
    filesFound: '',
    recoveredFlag: ''
  });
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [seenEvidence, setSeenEvidence] = useState({ passwd: false, last: false, find: false, flag: false });

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
            'cat /etc/passwd',
            'last <username>',
            'find / -user <username> -type f 2>/dev/null',
            'cat <file>',
            'clear'
          ]
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (normalized === 'cat /etc/passwd') {
        setSeenEvidence((prev) => ({ ...prev, passwd: true }));
        return { output: passwdLines };
      }

      if (cmd === 'last') {
        if (args.length !== 1) {
          return { output: ['usage: last <username>'] };
        }

        if (args[0] !== rogueUser) {
          return { output: ['wtmp begins Mon Apr 01 00:00:00 2026'] };
        }

        setSeenEvidence((prev) => ({ ...prev, last: true }));
        return {
          output: [
            `${rogueUser} pts/2  ${rogueLoginIp}  Fri Apr 17 02:41 - 02:57  (00:16)`,
            'wtmp begins Mon Apr 01 00:00:00 2026'
          ]
        };
      }

      if (cmd === 'find') {
        if (normalized.includes(`/ -user ${rogueUser} -type f`)) {
          setSeenEvidence((prev) => ({ ...prev, find: true }));
          return { output: rogueFiles };
        }

        return { output: ['find: no files found for supplied query'] };
      }

      if (cmd === 'cat') {
        if (args.length !== 1) {
          return { output: ['usage: cat <file>'] };
        }

        const filePath = args[0];
        if (filePath === rogueFiles[0]) {
          return { output: ['syncshadow note: persistence check complete.'] };
        }

        if (filePath === rogueFiles[1]) {
          setSeenEvidence((prev) => ({ ...prev, flag: true }));
          return { output: [`incident artifact flag: ${challengeFlag}`] };
        }

        return { output: [`cat: ${filePath}: No such file or directory`] };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [challengeFlag, rogueFiles, rogueUser, rogueLoginIp, passwdLines]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!seenEvidence.passwd || !seenEvidence.last || !seenEvidence.find || !seenEvidence.flag) {
      setIsCorrect(false);
      setFeedback('[err] complete all evidence steps in terminal before filing the incident report.');
      return;
    }

    const usernameCorrect = normalizeLower(report.username) === rogueUser;
    const sourceCorrect = normalizeText(report.loginSource) === rogueLoginIp;
    const filesCorrect = normalizeText(report.filesFound) === '2';
    const flagCorrect = normalizeText(report.recoveredFlag) === challengeFlag;
    const match = usernameCorrect && sourceCorrect && filesCorrect && flagCorrect;

    setIsCorrect(match);

    if (match) {
      setFeedback('[ok] incident report validated. rogue user investigation complete.');
      unlock();
      return;
    }

    const score = [usernameCorrect, sourceCorrect, filesCorrect, flagCorrect].filter(Boolean).length;
    setFeedback(`[err] ${score}/4 report fields are correct. revise your forensic notes.`);
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// USER HUNTER" accent="green" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-text-secondary">linux / forensics</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Identify the rogue user from `/etc/passwd`, inspect login history with `last`, enumerate owned files with
          `find`, then submit a mini incident report.
        </p>
      </div>

      <BrowserTerminal
        title="Week4 User Forensics"
        endpoint="browser-terminal://week4/user-hunter"
        prompt="analyst@ir:~$"
        introLines={['incident triage started.', 'follow the four-step forensic workflow from the mission brief.']}
        onCommand={handleCommand}
      />

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            Rogue username
          </span>
          <input
            value={report.username}
            onChange={(event) => setReport((prev) => ({ ...prev, username: event.target.value }))}
            className="terminal-input"
            placeholder="username"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            Login source IP
          </span>
          <input
            value={report.loginSource}
            onChange={(event) => setReport((prev) => ({ ...prev, loginSource: event.target.value }))}
            className="terminal-input"
            placeholder="x.x.x.x"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            File count discovered
          </span>
          <input
            value={report.filesFound}
            onChange={(event) => setReport((prev) => ({ ...prev, filesFound: event.target.value }))}
            className="terminal-input"
            placeholder="number"
          />
        </label>

        <label className={panelClassName}>
          <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
            Recovered flag
          </span>
          <input
            value={report.recoveredFlag}
            onChange={(event) => setReport((prev) => ({ ...prev, recoveredFlag: event.target.value }))}
            className="terminal-input"
            placeholder="FLAG{...}"
          />
        </label>

        <button type="submit" className="btn-primary md:col-span-2">
          SUBMIT INCIDENT REPORT
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

function OperationRootAccessBossGame({ challengeFlag, onFlagDiscovered }: GameProps) {
  const { unlock } = useOneTimeUnlock(challengeFlag, onFlagDiscovered);

  const sshUsername = 'finalagent';
  const sshPassword = 'RootTrail!2026';
  const challengeServer = 'challenge-server';

  const credentialBlob = useMemo(() => btoa(`${sshUsername}:${sshPassword}`), [sshUsername, sshPassword]);
  const [credentialInput, setCredentialInput] = useState({ username: '', password: '' });
  const [stageOneVerified, setStageOneVerified] = useState(false);
  const [stageOneMessage, setStageOneMessage] = useState('');

  const [isRemote, setIsRemote] = useState(false);
  const [cwd, setCwd] = useState('/home/learner');
  const [configClue, setConfigClue] = useState<string | null>(null);
  const [logClue, setLogClue] = useState<string | null>(null);
  const [docReadable, setDocReadable] = useState(false);
  const [docClue, setDocClue] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const clueParts = useMemo(() => {
    const split = Math.ceil(challengeFlag.length / 3);
    return [challengeFlag.slice(0, split), challengeFlag.slice(split, split * 2), challengeFlag.slice(split * 2)];
  }, [challengeFlag]);

  const handleVerifyCredentials = () => {
    const usernameMatch = normalizeText(credentialInput.username) === sshUsername;
    const passwordMatch = normalizeText(credentialInput.password) === sshPassword;

    if (usernameMatch && passwordMatch) {
      setStageOneVerified(true);
      setStageOneMessage('[ok] stage 1 verified. ssh access now authorized.');
      return;
    }

    setStageOneVerified(false);
    setStageOneMessage('[err] decoded credentials do not match. decode the browser blob again.');
  };

  const handleCommand = useCallback(
    (command: string): TerminalResult => {
      const tokens = tokenizeCommand(command);
      if (tokens.length === 0) {
        return { output: [] };
      }

      const [cmd, ...args] = tokens;
      const normalized = normalizeLower(command);
      const shellCommand = tokens.join(' ');

      const resolveRemoteDir = (target: string) => {
        if (
          target === '~' ||
          target === '/home/finalagent' ||
          target === '/home/finalagent/' ||
          target === '.'
        ) {
          return '/home/finalagent';
        }

        if (target === '/home/finalagent/mission' || target === 'mission') {
          return '/home/finalagent/mission';
        }

        if (target === '/home/finalagent/mission/configs' || target === 'configs') {
          return '/home/finalagent/mission/configs';
        }

        if (target === '/var/log/final') {
          return '/var/log/final';
        }

        if (target === '/srv/classified') {
          return '/srv/classified';
        }

        if (target === '..') {
          if (cwd === '/home/finalagent/mission/configs') {
            return '/home/finalagent/mission';
          }
          if (cwd === '/home/finalagent/mission') {
            return '/home/finalagent';
          }
          return '/home/finalagent';
        }

        return null;
      };

      if (normalized === 'help') {
        if (!isRemote) {
          return {
            output: [
              'Local commands:',
              'echo <base64-string> | base64 -d',
              `ssh ${sshUsername}@${challengeServer}`,
              'clear'
            ]
          };
        }

        return {
          output: [
            'Remote commands:',
            'pwd',
            'ls',
            'ls -la',
            'cd <dir>',
            "find /home/finalagent -name '.*config*' -type f",
            'grep ALPHA_KEY /var/log/final/audit.log',
            'chmod u+r /srv/classified/brief.txt',
            'cat <file>',
            'exit',
            'clear'
          ]
        };
      }

      if (normalized === 'clear') {
        return { clear: true, output: ['[terminal cleared]'] };
      }

      if (!isRemote) {
        const decodeMatch = command.match(/^echo\s+(.+)\s*\|\s*base64\s+-d\s*$/);
        if (decodeMatch) {
          let candidate = decodeMatch[1].trim();

          if (
            (candidate.startsWith('"') && candidate.endsWith('"')) ||
            (candidate.startsWith("'") && candidate.endsWith("'"))
          ) {
            candidate = candidate.slice(1, -1);
          }

          if (candidate === credentialBlob) {
            return { output: [`${sshUsername}:${sshPassword}`] };
          }

          try {
            return { output: [atob(candidate)] };
          } catch (_error) {
            return { output: ['base64: invalid input'] };
          }
        }

        if (normalized === `ssh ${sshUsername}@${challengeServer}`) {
          if (!stageOneVerified) {
            return {
              output: ['permission denied. decode stage 1 credentials and verify them in browser fields first.']
            };
          }

          setIsRemote(true);
          setCwd('/home/finalagent');
          return {
            output: [
              `Connecting to ${challengeServer}...`,
              'Authentication successful.',
              'Remote grand final node ready. run `help` for mission commands.'
            ]
          };
        }

        return { output: [shellCommandNotFound(shellCommand)] };
      }

      if (normalized === 'exit') {
        setIsRemote(false);
        setCwd('/home/learner');
        return { output: ['Connection to challenge-server closed.'] };
      }

      if (cmd === 'pwd') {
        return { output: [cwd] };
      }

      if (cmd === 'cd') {
        if (args.length !== 1) {
          return { output: ['usage: cd <directory>'] };
        }

        const next = resolveRemoteDir(args[0]);
        if (!next) {
          return { output: [`cd: no such file or directory: ${args[0]}`] };
        }

        setCwd(next);
        return { output: [] };
      }

      if (cmd === 'ls') {
        const showAll = args.some((item) => item.includes('a'));
        const dirs = args.filter((item) => !item.startsWith('-'));

        if (dirs.length > 1) {
          return { output: ['usage: ls [-la] [directory]'] };
        }

        const target = dirs[0] ? resolveRemoteDir(dirs[0]) : cwd;
        if (!target) {
          return { output: [`ls: cannot access '${dirs[0]}': No such file or directory`] };
        }

        if (target === '/home/finalagent') {
          return { output: ['mission/    notes.txt'] };
        }

        if (target === '/home/finalagent/mission') {
          return { output: ['configs/'] };
        }

        if (target === '/home/finalagent/mission/configs') {
          if (showAll) {
            return { output: ['.    ..    .hidden.config    baseline.yml'] };
          }
          return { output: ['baseline.yml'] };
        }

        if (target === '/var/log/final') {
          return { output: ['audit.log'] };
        }

        if (target === '/srv/classified') {
          return { output: ['brief.txt'] };
        }
      }

      if (cmd === 'find') {
        if (
          normalized.includes('find /home/finalagent') &&
          normalized.includes('config') &&
          normalized.includes('-type f')
        ) {
          return { output: ['/home/finalagent/mission/configs/.hidden.config'] };
        }

        return { output: ['find: no results'] };
      }

      if (cmd === 'grep') {
        if (normalized === 'grep alpha_key /var/log/final/audit.log') {
          setLogClue(clueParts[1]);
          return { output: [`742: ALPHA_KEY=${clueParts[1]}  src=remote-node-7`] };
        }

        return { output: ['grep: no matching lines'] };
      }

      if (cmd === 'chmod') {
        if (normalized === 'chmod u+r /srv/classified/brief.txt') {
          setDocReadable(true);
          return { output: ['chmod: /srv/classified/brief.txt is now readable by finalagent'] };
        }

        return { output: ['chmod: mission expects user-read fix on /srv/classified/brief.txt'] };
      }

      if (cmd === 'cat') {
        if (args.length !== 1) {
          return { output: ['usage: cat <file>'] };
        }

        const path = args[0];

        if (path === '/home/finalagent/notes.txt' || (cwd === '/home/finalagent' && path === 'notes.txt')) {
          return {
            output: [
              'Grand Final checklist:',
              '1) decode browser blob',
              '2) ssh to remote host',
              '3) recover config, grep logs, fix permissions'
            ]
          };
        }

        if (
          path === '/home/finalagent/mission/configs/.hidden.config' ||
          (cwd === '/home/finalagent/mission/configs' && path === '.hidden.config')
        ) {
          setConfigClue(clueParts[0]);
          return { output: [`config fragment => ${clueParts[0]}`] };
        }

        if (path === '/var/log/final/audit.log' || (cwd === '/var/log/final' && path === 'audit.log')) {
          return {
            output: [
              'audit.log is 1000 lines.',
              'hint: grep ALPHA_KEY /var/log/final/audit.log'
            ]
          };
        }

        if (path === '/srv/classified/brief.txt' || (cwd === '/srv/classified' && path === 'brief.txt')) {
          if (!docReadable) {
            return { output: ['cat: /srv/classified/brief.txt: Permission denied'] };
          }

          setDocClue(clueParts[2]);
          return { output: [`classified fragment => ${clueParts[2]}`] };
        }

        return { output: [`cat: ${path}: No such file or directory`] };
      }

      return { output: [shellCommandNotFound(shellCommand)] };
    },
    [challengeServer, credentialBlob, clueParts, cwd, docReadable, isRemote, sshPassword, sshUsername, stageOneVerified]
  );

  const handleValidate = () => {
    if (!configClue || !logClue || !docClue) {
      setIsCorrect(false);
      setFeedback('[err] gather all three clue fragments first (config, log grep, classified doc).');
      return;
    }

    const fullFlag = normalizeText(answer);
    const match = fullFlag === challengeFlag;
    setIsCorrect(match);

    if (match) {
      setFeedback('[ok] grand final solved. trophy ceremony triggered.');
      unlock();
      return;
    }

    setFeedback('[err] assembled flag mismatch. re-check clue fragments and ordering.');
  };

  return (
    <div className="space-y-4">
      <div className={panelClassName}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel label="// OPERATION ROOT ACCESS" accent="orange" />
          <p className="font-display text-[10px] uppercase tracking-[0.14em] text-alert-orange">grand final boss</p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Stage 1: decode browser Base64 to recover SSH credentials. Stage 2: SSH into remote challenge machine. Stage
          3: recover config clue, grep a log clue, fix permissions for a classified file, then assemble the final flag.
        </p>
      </div>

      <div className={panelClassName}>
        <p className="font-display text-[10px] uppercase tracking-[0.13em] text-neon-cyan">Stage 1 / Browser</p>
        <p className="mt-2 text-sm text-text-secondary">Decode this Base64 blob to retrieve `username:password`:</p>
        <p className="mt-2 break-all rounded border border-border-dim bg-bg-primary px-3 py-2 font-mono text-sm text-neon-green">
          {credentialBlob}
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label>
            <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
              SSH username
            </span>
            <input
              value={credentialInput.username}
              onChange={(event) => setCredentialInput((prev) => ({ ...prev, username: event.target.value }))}
              className="terminal-input"
              placeholder="username"
            />
          </label>

          <label>
            <span className="mb-2 block font-display text-[10px] uppercase tracking-[0.13em] text-text-secondary">
              SSH password
            </span>
            <input
              value={credentialInput.password}
              onChange={(event) => setCredentialInput((prev) => ({ ...prev, password: event.target.value }))}
              className="terminal-input"
              placeholder="password"
            />
          </label>
        </div>

        <button type="button" onClick={handleVerifyCredentials} className="btn-primary mt-3 w-full">
          VERIFY DECODED CREDENTIALS
        </button>

        {stageOneMessage && (
          <p
            className={`mt-3 rounded border px-3 py-2 font-display text-[11px] uppercase tracking-[0.1em] ${
              stageOneVerified
                ? 'border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green'
                : 'border-[rgba(255,107,53,0.45)] bg-[rgba(255,107,53,0.12)] text-alert-orange'
            }`}
          >
            {stageOneMessage}
          </p>
        )}
      </div>

      <BrowserTerminal
        title="Grand Final Shell"
        endpoint="browser-terminal://week4/operation-root-access"
        prompt={isRemote ? 'finalagent@challenge-server:~$' : 'learner@lab:~$'}
        introLines={[
          'Grand Final terminal online.',
          `Stage 2 command: ssh ${sshUsername}@${challengeServer}`,
          'Use `help` for local/remote command sets.'
        ]}
        onCommand={handleCommand}
      />

      <div className={panelClassName}>
        <p className="font-display text-[10px] uppercase tracking-[0.13em] text-neon-cyan">Clue Fragments</p>
        <div className="mt-2 space-y-2 text-sm text-text-secondary">
          <p>Config clue: <span className="text-text-primary">{configClue ?? 'not collected'}</span></p>
          <p>Log clue: <span className="text-text-primary">{logClue ?? 'not collected'}</span></p>
          <p>Classified clue: <span className="text-text-primary">{docClue ?? 'not collected'}</span></p>
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

export function Week4ActivityExperience({
  activityId,
  challengeFlag,
  onFlagDiscovered
}: Week4ActivityExperienceProps) {
  const renderChallenge = () => {
    if (activityId === 'hidden-file-heist') {
      return <HiddenFileHeistGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'permission-impossible') {
      return <PermissionImpossibleGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'log-hound') {
      return <LogHoundGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'encoded-script') {
      return <EncodedScriptGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'network-recon-mission') {
      return <NetworkReconMissionGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'user-hunter') {
      return <UserHunterGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    if (activityId === 'operation-root-access') {
      return <OperationRootAccessBossGame challengeFlag={challengeFlag} onFlagDiscovered={onFlagDiscovered} />;
    }

    return <Week4MissionUnavailable activityId={activityId} />;
  };

  return <Week4ChallengeShell>{renderChallenge()}</Week4ChallengeShell>;
}
