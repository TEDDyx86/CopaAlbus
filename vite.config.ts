/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/7-0Albus/', // nome do repo, para GitHub Pages (ajuste se publicar noutro caminho)
  plugins: [react(), tailwindcss()],
  test: { environment: 'node', globals: true },
});
