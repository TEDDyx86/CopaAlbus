export function Brand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`relative grid ${dim} place-items-center`}>
        <span
          className="absolute inset-0 rotate-45 rounded-[30%]"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            boxShadow: '0 0 18px -4px var(--color-accent)',
          }}
        />
        <span className="relative font-mono text-[0.7em] font-black text-accent-ink">N</span>
      </span>
      <span className={`font-extrabold uppercase tracking-[0.16em] ${text}`}>
        <span className="text-ink">Albus</span>{' '}
        <span className="text-accent">Nexus</span>
      </span>
    </span>
  );
}
