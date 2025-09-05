/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 20%, 98%)',
        text: 'hsl(220, 15%, 15%)',
        accent: 'hsl(35, 95%, 55%)',
        primary: 'hsl(215, 95%, 45%)',
        surface: 'hsl(220, 25%, 93%)',
      },
      borderRadius: {
        'lg': '16px',
        'md': '10px',
        'sm': '6px',
      },
      spacing: {
        'lg': '20px',
        'md': '12px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(220, 15%, 15%, 0.12)',
      },
    },
  },
  plugins: [],
}