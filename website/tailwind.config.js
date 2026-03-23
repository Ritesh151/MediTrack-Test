/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0056D2',
          light: '#E6F3FF',
        },
        secondary: '#008080',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        'card-border': '#E0E0E0',
        'text-primary': '#1A1A1B',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}
