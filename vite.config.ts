import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/suvenir-download/', // ← metti il nome della repo su GitHub
  build: {
    outDir: 'dist', // default, va bene
  },
});

