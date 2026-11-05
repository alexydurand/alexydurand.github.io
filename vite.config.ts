import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base: works on localhost and on GitHub Pages (/portfolio.alexydurand/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Two pages: the one-page site and the legal notice
      input: { main: 'index.html', legal: 'mentions-legales.html' },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
        },
      },
    },
  },
});
