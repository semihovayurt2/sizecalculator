/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        card: '#FFFFFF',
        border: '#E5E7EB',
        heading: '#111827',
        text: '#6B7280',
        accent: '#FF7A00'
      },
      boxShadow: {
        glow: '0 10px 40px rgba(255,122,0,0.08)',
      }
    }
  },
  plugins: []
};
