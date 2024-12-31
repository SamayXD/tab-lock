import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        blocked: path.resolve(__dirname, 'blocked.html')
      },
    },
    outDir: 'dist',
  },
  publicDir: 'public',
});