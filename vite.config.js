import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

// GitHub Pages needs a 404 copy of the app so direct visits to React routes still work.
const githubPagesFallback = {
  name: 'github-pages-spa-fallback',
  apply: 'build',
  closeBundle() {
    const outputDirectory = resolve(process.cwd(), 'dist');
    copyFileSync(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'));
  },
};

export default defineConfig({
  // Set VITE_BASE_PATH for GitHub Pages; local development uses the site root.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [githubPagesFallback],
  esbuild: {
    jsx: 'automatic',
  },
});