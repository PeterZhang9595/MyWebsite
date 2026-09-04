export type BioVariant = 'default' | 'long';

export function initialBioVariant(): BioVariant {
  return 'default';
}

export function selectBioVariant(
  current: BioVariant,
  requested: BioVariant,
  hasLong: boolean,
): BioVariant {
  if (requested === 'long' && !hasLong) return current;
  return requested;
}
