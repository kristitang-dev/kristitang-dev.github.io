import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages URL: https://kristitang-dev.github.io/
//
// This repo is a *user site* (named username.github.io), so it is served
// from the domain root. base MUST be '/'.
//
// If this were a *project site* instead (username.github.io/repo-name/),
// you would set base to '/repo-name/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    // tsc emit sits beside the sources (Hero.js + Hero.tsx). Prefer TypeScript.
    extensions: ['.tsx', '.ts', '.jsx', '.mjs', '.js', '.mts', '.json'],
  },
})
