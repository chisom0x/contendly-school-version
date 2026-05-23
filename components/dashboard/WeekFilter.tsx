export type WeekFilterValue = 'ALL' | 1 | 2 | 3 | 4;

interface WeekFilterProps {
  value: WeekFilterValue;
  onChange: (value: WeekFilterValue) => void;
}

const weekOptions: WeekFilterValue[] = ['ALL', 1, 2, 3, 4];

export function WeekFilter({ value, onChange }: WeekFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {weekOptions.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 font-display text-[11px] uppercase tracking-[0.11em] transition-all duration-200 ${
              isActive
                ? 'border-neon-green bg-[rgba(0,255,136,0.08)] text-neon-green'
                : 'border-border-dim bg-transparent text-text-secondary hover:border-border-bright hover:text-text-primary'
            }`}
          >
            {option === 'ALL' ? 'ALL' : `WEEK ${option}`}
          </button>
        );
      })}
    </div>
  );
}
