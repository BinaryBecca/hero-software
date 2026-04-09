/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hero: {
          base: '#1a1a1a',
          surface: '#202020',
          surfaceAlt: '#262626',
          border: '#343434',
          accent: '#FFD700',
          accentSoft: 'rgba(255, 215, 0, 0.14)',
          text: '#FFFFFF',
          muted: '#A3A3A3',
          danger: '#EF4444',
          success: '#22C55E',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255, 215, 0, 0.18), 0 24px 80px rgba(0, 0, 0, 0.35)',
        yellow: '0 12px 30px rgba(255, 215, 0, 0.14)',
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      animation: {
        pulseRing: 'pulseRing 1.5s ease-in-out infinite',
        toastUp: 'toastUp 0.25s ease-out',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.45)' },
          '50%': { boxShadow: '0 0 0 14px rgba(239, 68, 68, 0)' },
        },
        toastUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
