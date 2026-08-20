/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',
          'primary-hover': '#4338CA',
          'primary-light': '#EEF2FF',
          'primary-container': '#4F46E5',
          background: '#F8F9FD',
          surface: '#FFFFFF',
          text: '#141B2B',
          secondary: '#006C49',
          'secondary-hover': '#005439',
          'secondary-container': '#6CF8BB',
          tertiary: '#684000',
          error: '#BA1A1A',
          border: '#EAEFF8',
          muted: '#64748B',
          'surface-hover': '#F8FAFC',
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', '"Plus Jakarta Sans"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'std': '10px',
        'card': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(20, 27, 43, 0.03)',
        'soft-md': '0 4px 20px rgba(20, 27, 43, 0.05)',
        'soft-lg': '0 10px 30px -5px rgba(79, 70, 229, 0.1)',
      }
    },
  },
  plugins: [],
}
