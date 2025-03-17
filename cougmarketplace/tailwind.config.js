/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}', // Make sure to include `app` folder
      './pages/**/*.{js,ts,jsx,tsx}', // Include `pages` folder
      './components/**/*.{js,ts,jsx,tsx}', // Include `components` folder
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  