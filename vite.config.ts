import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// BASE_PATH: '/TinyPortfolio/' on GitHub Pages (set by the workflow); '/' on Vercel or a root domain.
export default defineConfig({ base: process.env.BASE_PATH ?? '/', plugins: [react()] });
