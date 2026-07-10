/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Keep in sync with src/theme/tokens.ts — duplicated because this file
      // is loaded by plain Node (can't require a .ts file without extra
      // tooling), while tokens.ts is the typed source used by app code.
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        primary: '#f59e0b',
        text: '#f8fafc',
        textMuted: '#94a3b8',
        danger: '#ef4444',
        success: '#22c55e',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
    },
  },
  plugins: [],
};
