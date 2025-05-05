/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      spacing: {
        '6': '1.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem'
      },
      colors: {
        primary: '#16a34a', // Tailwind green-600
        secondary: '#f3f4f6', // Tailwind gray-100
        accent: '#2563eb', // Tailwind blue-600
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
        '4xl': '2.25rem', // slightly larger for headings
        '5xl': '3rem'
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100'
      }
    },
  },
  plugins: [],
}
