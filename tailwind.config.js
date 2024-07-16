module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bloodlust: ['bloodlust', 'sans-serif'],
        futura: ['futurahandwritten'],
      },
      backgroundImage: {
        'winner': "url('../src/images/winner.png')",
      },
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
};
