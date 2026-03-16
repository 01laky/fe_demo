import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_DEV_PORT) || 8081,
    host: true, // Allow access from network
    proxy: {
      // Proxy Seq logs to avoid CORS/503 when FE sends logs from browser
      // In Docker: target http://seq:5341 (same network). Locally: localhost:5342
      '/seq-proxy': {
        target: process.env.VITE_SEQ_PROXY_TARGET || 'http://localhost:5342',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/seq-proxy/, ''),
      },
    },
  },
  // Enable JSON imports
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  // Define environment variables with defaults
  define: {
    __APP_NAME__: JSON.stringify(process.env.VITE_APP_NAME || 'Be Demo Frontend'),
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION || '1.0.0'),
  },
});
