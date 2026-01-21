import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './', // HAPUS INI. Biarkan default (absolute path) agar PWA bisa load asset dengan benar.
});