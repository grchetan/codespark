/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Centralized CSS Variable Tokens
        theme: {
          bg: {
            primary: 'var(--bg-primary)',
            secondary: 'var(--bg-secondary)',
            elevated: 'var(--bg-elevated)',
          },
          text: {
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
            muted: 'var(--text-muted)',
          },
          border: {
            DEFAULT: 'var(--border)',
            strong: 'var(--border-strong)',
          },
          accent: {
            DEFAULT: 'var(--accent)',
            hover: 'var(--accent-hover)',
            soft: 'var(--accent-soft)',
          },
        },
        background: {
          50: '#FAF6EE',
          100: '#F5EFE6',
          200: '#EAE2D5',
          300: '#DDD5C8',
          400: '#C8C2B9', // Clean warm off-white / light gray (no muddy brown)
          500: '#A69F94', // Neutral warm tone
          600: '#918A80', // Legible muted tone (no muddy dark brown)
          700: '#686259',
          800: '#3D3833',
          950: '#0D0F12', // Deep cinematic base
        },
        foreground: {
          50: '#FAF7F5',
          100: '#EFEAE6',
          200: '#DDD5CF',
          300: '#C2B8B0',
          400: '#8E8880',
          500: '#6F6962',
          600: '#524D46',
          700: '#3A3530',
          800: '#221F1C',
          950: '#0F1115',
        },
        primary: {
          50: '#FFF2EC',
          100: '#FFE2D4',
          200: '#FFC2A8',
          300: '#FF9970',
          400: '#FF624B',
          500: '#FF4B32', // Signature CodeSpark Orange/Red
          600: '#E63819',
          700: '#BF260B',
          800: '#991F09',
          950: '#4D0C02',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          950: '#0F172A',
        },
        accent: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          950: '#022C22',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Playfair Display"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
    },
  },
  plugins: [],
}
