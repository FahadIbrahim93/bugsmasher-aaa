import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@managers': path.resolve(__dirname, './src/managers'),
      '@renderers': path.resolve(__dirname, './src/renderers'),
      '@audio': path.resolve(__dirname, './src/audio'),
      '@input': path.resolve(__dirname, './src/input'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@typedefs': path.resolve(__dirname, './src/types'),
    },
  },
});
