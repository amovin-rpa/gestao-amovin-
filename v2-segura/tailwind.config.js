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
        amovin: {
          laranja: '#C65A11',
          amarelo: '#F5C518',
          verde: '#57C220',
          azul: '#1E88E5',
          grafite: '#1A1A1A',
          cinza: '#6B7280',
          cinzaClaro: '#F8F4ED',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
