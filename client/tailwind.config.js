/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Slate shades for dark mode cards and surfaces
        slate: {
          750: '#1e293b',
          850: '#111c30',
        },
        // Semantic neutral palette mapped via CSS variables for smooth light/dark switching
        neutral: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          text: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          dim: 'var(--color-text-dim)',
        },
        // Electric Azure Brand
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Vibrant Petrol / Cyan Energy
        petrol: {
          DEFAULT: '#0891B2', // Cyan 600
          hover: '#0E7490',
          dark: '#155E75',
          light: '#E0F2FE',
          tint: 'rgba(8, 145, 178, 0.12)',
        },
        // Vibrant Safety Flame Orange
        safety: {
          DEFAULT: '#F97316', // Orange 500
          hover: '#EA580C',
          dark: '#C2410C',
          light: '#FFF7ED',
          tint: 'rgba(249, 115, 22, 0.12)',
        },
        // Algerian Emerald Energy (Green)
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Operational Status Colors with High Contrast & Vibrancy
        status: {
          success: '#10B981',
          'success-bg': 'rgba(16, 185, 129, 0.12)',
          warning: '#F59E0B',
          'warning-bg': 'rgba(245, 158, 11, 0.12)',
          danger: '#EF4444',
          'danger-bg': 'rgba(239, 68, 68, 0.12)',
          info: '#0EA5E9',
          'info-bg': 'rgba(14, 165, 233, 0.12)',
        },
      },
      fontFamily: {
        title: ['"Plus Jakarta Sans"', '"Cairo"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Cairo"', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['"Cairo"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        cyan: '0 10px 25px -5px rgba(8, 145, 178, 0.25)',
        emerald: '0 10px 25px -5px rgba(16, 185, 129, 0.25)',
        amber: '0 10px 25px -5px rgba(245, 158, 11, 0.25)',
        orange: '0 10px 25px -5px rgba(249, 115, 22, 0.25)',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
