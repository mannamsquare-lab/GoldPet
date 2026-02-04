import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // 외부 접근 허용 (Flutter WebView에서 접근 가능하도록)
    allowedHosts: ['*.ciccosoft.com', 'www.ciccosoft.com', 'app.ciccosoft.com', '10.80.1.59'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public', // public 디렉토리 명시
  define: {
    global: 'globalThis', // SockJS compatibility for browser
  },
});
