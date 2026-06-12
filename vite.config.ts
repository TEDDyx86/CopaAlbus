/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Caminhos relativos: funciona servido na raiz (Vercel) e em subpasta (GitHub Pages).
  base: './',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node', globals: true },
});
