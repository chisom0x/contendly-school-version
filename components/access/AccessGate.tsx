'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { TerminalCursor } from '@/components/shared/TerminalCursor';
import { persistLearnerSession } from '@/lib/auth';
import { getLearnerMe, loginLearner, type AuthErrorCode } from '@/lib/auth-api';

const authLogLines = [
  '[ok] verifying access token...',
  '[ok] identity confirmed',
  '[ok] loading mission dashboard...'
];
const authErrorTextByCode: Record<AuthErrorCode, string> = {
  AUTH_INVALID_CODE: '// ACCESS DENIED - INVALID CODE',
  AUTH_NETWORK_ERROR: '// NETWORK ERROR - CHECK CONNECTION AND RETRY',
  AUTH_TOKEN_MISSING: '// AUTH SERVICE ERROR - INVALID SESSION RESPONSE',
  AUTH_REQUEST_FAILED: '// AUTH SERVICE ERROR - TRY AGAIN'
};

const terminalFeedLines = [
  '[SYSTEM] Project Defend - Season 01',
  '[INIT]   Loading operative profiles...',
  '[SECURE] AES-256 channel established',
  '[READY]  CTF modules armed',
  '[WAIT]   Awaiting operative authentication...'
];

export function AccessGate() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);

  const [feedHistory, setFeedHistory] = useState<string[]>([]);
  const [activeFeedLine, setActiveFeedLine] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;

    const runLoop = () => {
      const currentLine = terminalFeedLines[lineIndex];

      if (charIndex <= currentLine.length) {
        setActiveFeedLine(currentLine.slice(0, charIndex));
        charIndex += 1;
        timeoutRef.current = setTimeout(runLoop, 46);
        return;
      }

      setFeedHistory((prev) => {
        const next = [...prev, currentLine];
        return next.slice(-5);
      });

      timeoutRef.current = setTimeout(() => {
        setActiveFeedLine('');
        charIndex = 0;
        lineIndex = (lineIndex + 1) % terminalFeedLines.length;
        runLoop();
      }, 760);
    };

    runLoop();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAuthenticate = async () => {
    const normalizedCode = accessCode.trim();

    if (!normalizedCode) {
      setError('// ACCESS CODE REQUIRED');
      return;
    }

    setError('');
    setIsAuthenticating(true);
    setLogLines([]);
    const startedAt = Date.now();

    for (const line of authLogLines) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setLogLines((prev) => [...prev, line]);
    }

    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(1500 - elapsed, 0);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    try {
      const accessToken = await loginLearner(normalizedCode);
      const learner = await getLearnerMe(accessToken);
      persistLearnerSession(normalizedCode, accessToken, {
        id: learner.id,
        fullName: learner.fullName,
        accessCode: learner.accessCode
      });
      router.push('/dashboard');
    } catch (error) {
      const errorCode =
        error instanceof Error && error.message in authErrorTextByCode
          ? (error.message as AuthErrorCode)
          : 'AUTH_REQUEST_FAILED';

      setLogLines((prev) => [...prev, '[err] authentication rejected']);
      setError(authErrorTextByCode[errorCode]);
      setIsAuthenticating(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mx-auto grid min-h-screen w-full max-w-[1240px] grid-cols-1 px-5 py-10 md:px-8 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-10 lg:py-16">
        <section className="flex items-center">
          <div className="w-full">
            <div className="mb-5 flex items-center gap-2 font-display text-base font-bold tracking-[0.06em] text-text-primary sm:text-lg">
              <span className="text-neon-green">[</span>
              <span>CONTENDLY</span>
              <span className="text-neon-green">]</span>
            </div>

            <SectionLabel label="// CLEARANCE REQUIRED" accent="green" className="mb-4" />

            <div className="rounded border border-border-dim border-l-4 border-l-neon-green bg-bg-surface p-5 shadow-panel-soft sm:p-7">
              <h1 className="font-display text-[22px] text-text-primary">Enter Access Code</h1>
              <p className="mt-2 max-w-lg text-sm text-text-secondary">
                Use your instructor-issued access code to authenticate and begin your mission.
              </p>

              <div className="mt-6 space-y-3">
                <p className="flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">
                  root@contendly:~$ access --token
                  <TerminalCursor className="h-[12px] w-[6px] bg-neon-green" />
                </p>
                <input
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !isAuthenticating) {
                      void handleAuthenticate();
                    }
                  }}
                  placeholder="_ _ _ _ - _ _ _ _"
                  className="terminal-input"
                  autoComplete="off"
                  disabled={isAuthenticating}
                  aria-label="Access code"
                />
                {error && (
                  <p className="font-display text-[11px] uppercase tracking-[0.15em] text-alert-orange">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuthenticating ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
              </button>

              {isAuthenticating && (
                <div className="mt-5 space-y-2 rounded border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.06)] p-3 font-display text-xs text-neon-green">
                  {logLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-4 text-sm text-text-secondary">
              Don&apos;t have an access code? Contact your instructor.
            </p>
          </div>
        </section>

        <aside className="relative hidden lg:flex lg:items-center lg:justify-end">
          <div className="w-full max-w-[420px] rounded border border-[rgba(0,229,255,0.22)] bg-[linear-gradient(145deg,rgba(7,12,26,0.92),rgba(14,22,40,0.86))] p-4">
            <div className="mb-3 flex items-center justify-between border-b border-[rgba(149,164,195,0.16)] pb-3">
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <p className="font-display text-[11px] uppercase tracking-[0.1em] text-text-secondary">
                project-defend://secure-terminal
              </p>
            </div>

            <div className="h-[420px] space-y-2 overflow-hidden rounded border border-[rgba(149,164,195,0.12)] bg-[rgba(2,7,18,0.45)] px-3 py-4 font-display text-[12px] leading-relaxed text-neon-green/50 blur-[0.25px]">
              {feedHistory.map((line, index) => (
                <p key={`${line}-${index}`} className="whitespace-nowrap opacity-70">
                  {line}
                </p>
              ))}
              <p className="whitespace-nowrap">
                {activeFeedLine}
                <TerminalCursor className="ml-1 h-[13px] w-[6px] bg-neon-cyan" />
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
