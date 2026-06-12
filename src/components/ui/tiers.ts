import type { Tier } from '../../types';

export interface TierMeta {
  label: string;
  color: string;       // var(--color-*) da raridade
  /** classe utilitária de texto */
  text: string;
}

export const TIER_META: Record<Tier, TierMeta> = {
  lendario: { label: 'Lendário', color: 'var(--color-lendario)', text: 'text-lendario' },
  epico: { label: 'Épico', color: 'var(--color-epico)', text: 'text-epico' },
  raro: { label: 'Raro', color: 'var(--color-raro)', text: 'text-raro' },
  comum: { label: 'Comum', color: 'var(--color-comum)', text: 'text-comum' },
};
