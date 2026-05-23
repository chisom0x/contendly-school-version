export function TerminalCursor({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-[1.05em] w-[7px] animate-blink bg-neon-cyan align-[-0.15em] ${className}`}
    />
  );
}
