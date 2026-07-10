// Plain values (no TS-only syntax beyond type annotations) so the same
// palette can be read from tailwind.config.js (see the copy kept there,
// commented as "keep in sync with src/theme/tokens.ts" — tailwind.config.js
// is loaded by plain Node, which can't require a .ts file without extra
// tooling, so we accept this small duplication instead of adding a loader).
export const colors = {
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  primary: '#f59e0b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  danger: '#ef4444',
  success: '#22c55e',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Typography: Tailwind's default scale (text-xs..text-4xl, font-normal..font-bold)
// already covers what this app needs, so there's no custom fontSize/fontFamily
// extension here — extending it would just duplicate values that already work.
