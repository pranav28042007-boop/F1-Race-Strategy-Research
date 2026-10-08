/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          darkRed: '#960400',
          dark: '#0B0E14',
          card: '#121722',
          border: '#1F2937',
          gray: '#8C9BAE',
          accent: '#00D2BE',      // Petronas teal / accent
          amber: '#FF8700',       // Caution / warning
          yellow: '#FFDE00',      // Yellow flag
          green: '#00D2BE',       // Green flag / racing green
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif']
      }
    },
  },
  plugins: [],
}
