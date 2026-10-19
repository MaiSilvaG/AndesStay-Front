import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://jfif2nhuq3.execute-api.us-east-1.amazonaws.com/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});