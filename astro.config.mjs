// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "it", "ro"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // Vercel adapter for serverless functions (Actions)
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split Three.js and related libraries into separate chunks
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three';
            }
            // Split other large dependencies
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase limit to 1MB to reduce warnings
    },
  },

  integrations: [react()],
});