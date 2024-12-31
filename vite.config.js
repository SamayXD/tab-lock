import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html', // Entry point for popup
      },
    },
    outDir: 'dist', // Output folder
  },
  publicDir: 'public', // Ensure public files like manifest.json and icon are copied
});
