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
          indigo: '#4F46E5',
          'indigo-hover': '#4338CA',
          orange: '#F97316',
          'orange-hover': '#EA580C',
          dark: '#111827',
          muted: '#6B7280',
          bg: '#F9FAFB',
          border: '#E5E7EB',
          surface: '#FFFFFF',
          success: '#16A34A',
          error: '#DC2626',
          warning: '#D97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'btn': '8px',
        'input': '8px',
        'card': '12px',
        'modal': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'elevated': '0 2px 4px -1px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
