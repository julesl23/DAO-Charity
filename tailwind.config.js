const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-yellow': '#BAA333',

        'palette1-dark-purple': '#540074',
        'palette1-light-purple': '#510898',
        'palette1-pink': '#e458b9',
        'palette1-light-pink': '#ff8bec',
        'palette1-dark-pink': '#8836d5',
        'palette1-dark-gray': '#1b1d1e',
        'palette1-gray': '#3c4143',
        'palette1-medium-light-gray': '#776f62',
        'palette1-light-gray': '#adadad',
        'palette1-medium-dark-gray': '#232324',
        'palette1-blue': '#1d169c',
        'palette1-light-blue': '#1d169c',
        'palette1-black': '#181a1b',
        'palette1-white': '#d0d3cd',
        'palette1-lighter-purple': 'rgb(67 56 202)',
        'palette1-divide-colour1': '#363b3d',
        'palette1-action-colour1': '#1043b2',
        'palette1-hover-colour1': '#2552b5',
        'palette1-border-colour1': '#2563EB',
        'palette1-focus-colour1': '#08596f',
        'palette1-divide-color1': '#363b3d',

        'palette1-divide-colour2': 'rgb(99 102 241)',
        'palette1-action-colour2': 'rgb(79 70 229)',
        'palette1-hover-colour2': 'rgb(67 56 202)',
        'palette1-focus-colour2': 'rgb(99 102 241)',

        'darkmode-palette1-dark-purple': '#540074',
        'darkmode-palette1-light-purple': '#a653f6',
        'darkmode-palette1-pink': '#e458b9',
        'darkmode-palette1-gray': '#ababae',
        'darkmode-palette1-black': '#232324',
        'darkmode-palette1-white': '#ffffff',
        'darkmode-palette1-lighter-purple': 'rgb(67 56 202)',
      },
    },
  },
  plugins: [],
}
