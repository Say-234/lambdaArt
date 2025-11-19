/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5D4037',
        secondary: '#8D6E63',
        accent: '#D7CCC8',
        light: '#EFEBE9',
        dark: '#3E2723',
        white: '#FFFFFF',
        black: '#212121',
      },
      fontFamily: {
        main: ['Poppins', 'sans-serif'],
        title: ['Georgia', 'serif'],
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
        md: '0 4px 8px rgba(0,0,0,0.15)',
        lg: '0 8px 16px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
