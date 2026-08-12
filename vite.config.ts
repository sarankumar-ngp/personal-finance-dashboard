import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        analytics: resolve(__dirname, 'analytics.html'),
        transactions: resolve(__dirname, 'transactions.html'),
      },
    },
  },
});
