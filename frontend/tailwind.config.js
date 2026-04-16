/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // Deep sleek dark background
        surface: '#1E293B',    // Slate 800 for panels
        surfaceHighlight: '#334155', // Slate 700 for hovers
        primary: '#3B82F6',    // Blue 500 for primary actions
        primaryHover: '#2563EB',// Blue 600
        textMain: '#F1F5F9',   // Slate 100
        textMuted: '#94A3B8',  // Slate 400
        accent: '#10B981',     // Emerald 500 for success/highlights
        accentHover: '#059669',// Emerald 600
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
