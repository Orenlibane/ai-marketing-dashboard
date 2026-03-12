/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy Backgrounds
        'slate-deep': '#0F172A',
        'slate-mid': '#1E293B',
        'slate-light': '#334155',

        // Primary Accent Colors
        'neon-purple': '#A855F7',
        'neon-blue': '#3B82F6',
        'neon-cyan': '#06B6D4',
        'neon-pink': '#EC4899',

        // Glass Colors
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        'tight-custom': '-0.02em',
      },
      backdropBlur: {
        'glass': '12px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'float': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slideUp': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scaleIn': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'glow': {
          from: { boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)' },
          to: { boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
