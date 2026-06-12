import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'subtle';
type Size = 'md' | 'lg';

const BASE =
  'relative inline-flex items-center justify-center gap-2 font-bold tracking-tight ' +
  'rounded-md transition-all duration-150 select-none ' +
  'disabled:opacity-40 disabled:pointer-events-none active:translate-y-px';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-ink shadow-[0_8px_24px_-10px_var(--color-accent)] ' +
    'hover:brightness-110 hover:shadow-[0_10px_30px_-8px_var(--color-accent)]',
  ghost:
    'bg-surface/60 text-ink ring-1 ring-line hover:ring-accent hover:bg-surface-2',
  subtle:
    'bg-transparent text-ink-muted hover:text-ink hover:bg-surface/60',
};

const SIZES: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
