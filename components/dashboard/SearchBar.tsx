import { ChangeEvent } from 'react';
import { TerminalCursor } from '@/components/shared/TerminalCursor';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="w-full">
      <p className="mb-2 flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.14em] text-neon-green">
        root@contendly:~$ missions --grep
        <TerminalCursor className="h-[11px] w-[6px] bg-neon-green" />
      </p>
      <input
        value={value}
        onChange={handleChange}
        placeholder="search missions..."
        className="terminal-input"
        aria-label="Search missions"
      />
    </div>
  );
}
