interface SectionLabelProps {
  label: string;
  accent?: 'green' | 'cyan' | 'orange';
  className?: string;
}

const accentMap = {
  green:
    'text-neon-green bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.35)]',
  cyan:
    'text-neon-cyan bg-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.35)]',
  orange:
    'text-alert-orange bg-[rgba(255,107,53,0.1)] border-[rgba(255,107,53,0.35)]'
};

export function SectionLabel({ label, accent = 'green', className = '' }: SectionLabelProps) {
  return (
    <p
      className={`inline-flex items-center rounded-full border px-3 py-1 font-display text-[11px] uppercase tracking-[0.15em] ${accentMap[accent]} ${className}`}
    >
      {label}
    </p>
  );
}
