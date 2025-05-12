/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'smartcheck': {
          bg: '#F2F2F2',
          text: '#000000',
          accent: '#FFDE59',
          blue: '#004AAD',
          gray: '#C9C9C9'
        }
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            h2: {
              color: '#004AAD',
            },
            a: {
              color: '#004AAD',
              '&:hover': {
                color: '#FFDE59',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}