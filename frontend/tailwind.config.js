/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0a0f1e',
        'bg-surface': '#0f172a',
        'bg-elevated': '#1e293b',
        'accent-cyan': '#00d4ff',
        'accent-cyan-dim': '#00d4ff33',
        'text-primary': '#e2e8f0',
        'text-muted': '#94a3b8',
        'text-inverse': '#0a0f1e',
        'severity-low': '#22c55e',
        'severity-medium': '#eab308',
        'severity-severe': '#ef4444',
        'border-subtle': '#1e293b',
        'border-glow': '#00d4ff55',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 16px #00d4ff44',
        'glow-red': '0 0 16px #ef444444',
        'glow-yellow': '0 0 16px #eab30844',
        'glow-green': '0 0 16px #22c55e44',
        'card': '0 4px 24px rgba(0,0,0,0.6)',
        'glow-cyan-strong': '0 0 20px #00d4ff66',
      },
      borderRadius: {
        card: '12px',
        input: '8px',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'radar': 'radar 2s ease-out infinite',
        'count-up': 'count-up 0.8s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'radar': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
