/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Volatility Cats Design System
        primary: '#fb5a49',     // Coral Red - 주요 액션, 강조
        secondary: '#fed16e',   // Sunshine Yellow - 보상, 긍정
        accent: '#f0b07d',      // Peach - 부드러운 강조
        
        // Legacy (호환성 유지)
        btc: '#F7931A',
        eth: '#627EEA',
        privy: '#676FFF',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-warm': 'linear-gradient(135deg, #fb5a49 0%, #f0b07d 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(251, 90, 73, 0.1) 0%, rgba(240, 176, 125, 0.1) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(251, 90, 73, 0.4)',
      },
      animation: {
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}

