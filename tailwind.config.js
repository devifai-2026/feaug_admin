/** @type {import('tailwindcss').Config} */
export default {
 content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Matches the storefront: Poppins for body/data, Passenger Display
        // for headings and brand moments.
        'poppins': ['"Poppins"', 'sans-serif'],
        'sans': ['"Poppins"', 'sans-serif'],
        'passenger': ['"Passenger Display"', '"Poppins"', 'sans-serif'],
        'display': ['"Passenger Display"', '"Poppins"', 'sans-serif'],
        'serif': ['"Passenger Display"', '"Poppins"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
