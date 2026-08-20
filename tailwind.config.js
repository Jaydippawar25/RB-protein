/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0B0A',
          charcoal: '#141613',
          surface: '#1B1F1B',
          border: '#2A2F2A',
          green: {
            50: '#FFF4EB',
            100: '#FFE3CC',
            300: '#FFAE73',
            400: '#FF6600',
            500: '#FF4000',   // primary fiery electric orange theme color
            600: '#E63900',
            700: '#B82E00',
            900: '#5C1700',
          },
          orange: {
            50: '#FFF4EB',
            100: '#FFE3CC',
            300: '#FFAE73',
            400: '#FF6600',
            500: '#FF4000',
            600: '#E63900',
            700: '#B82E00',
            900: '#5C1700',
          },
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(255, 64, 0, 0.45)',
        card: '0 4px 24px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 20% 20%, rgba(255,64,0,0.15), transparent 45%)',
      },
    },
  },
  plugins: [],
};
