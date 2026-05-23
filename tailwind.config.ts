import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e1a',
        'bg-surface': '#0f1420',
        'bg-surface-2': '#151b2e',
        'border-dim': '#1e2a45',
        'border-bright': '#2a3a5c',
        'neon-green': '#00ff88',
        'neon-green-dim': '#00cc6a',
        'neon-green-glow': 'rgba(0, 255, 136, 0.12)',
        'neon-cyan': '#00e5ff',
        'neon-cyan-dim': 'rgba(0, 229, 255, 0.08)',
        'alert-orange': '#ff6b35',
        'alert-orange-dim': 'rgba(255, 107, 53, 0.12)',
        'text-primary': '#e8edf5',
        'text-secondary': '#8892a4',
        'text-dim': '#4a5568',
        'mono-green': '#00ff88'
      },
      fontFamily: {
        display: ['var(--font-space-mono)', 'monospace'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace']
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px'
      },
      boxShadow: {
        'green-glow': '0 0 16px rgba(0, 255, 136, 0.3)',
        'panel-soft': '0 10px 24px rgba(0, 0, 0, 0.28)'
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' }
        },
        flash: {
          '0%': { boxShadow: '0 0 0 rgba(0, 255, 136, 0)' },
          '40%': { boxShadow: '0 0 30px rgba(0, 255, 136, 0.35)' },
          '100%': { boxShadow: '0 0 0 rgba(0, 255, 136, 0)' }
        }
      },
      animation: {
        blink: 'blink 1s steps(1) infinite',
        shake: 'shake 0.35s ease-in-out',
        flash: 'flash 0.8s ease-out'
      }
    }
  },
  plugins: []
};

export default config;
