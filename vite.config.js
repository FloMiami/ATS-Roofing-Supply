import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const githubPagesFallback = {
  name: 'github-pages-spa-fallback',
  apply: 'build',
  closeBundle() {
    const outputDirectory = resolve(process.cwd(), 'dist');
    copyFileSync(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'));
  },
};

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [githubPagesFallback],
  esbuild: {
    jsx: 'automatic',
  },
});