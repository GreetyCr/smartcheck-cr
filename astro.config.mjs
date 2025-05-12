import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  compressHTML: true,
  output: 'static',
  build: {
    assets: 'assets'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    domains: ['picsum.photos', 'via.placeholder.com'],
    defaultQuality: 80,
    formats: ['avif', 'webp'],
    fallbackFormat: 'png'
  },
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false
        },
        compress: {
          drop_console: true
        }
      }
    },
    ssr: {
      noExternal: []
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
});