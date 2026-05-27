/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#051424',
        surface: '#051424',
        'surface-container-lowest': '#010f1f',
        'surface-container-low': '#0d1c2d',
        'surface-container': '#122131',
        'surface-container-high': '#1c2b3c',
        'surface-container-highest': '#273647',
        'surface-bright': '#2c3a4c',
        primary: '#bec6e0',
        'primary-container': '#0f172a',
        secondary: '#bcc7de',
        'on-surface': '#d4e4fa',
        'on-surface-variant': '#c6c6cd',
        'on-background': '#d4e4fa',
        outline: '#909097',
        'outline-variant': '#45464d',
        tertiary: '#dec29a',
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'status-critical': '#ef4444',
        'status-success': '#10b981',
        'status-info': '#3b82f6',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      spacing: {
        card_gap: '20px',
        container_padding: '24px',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.1em', fontWeight: '700' }],
        'data-sm': ['14px', { lineHeight: '20px', letterSpacing: '0', fontWeight: '500' }],
        'data-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.05em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
    },
  },
};