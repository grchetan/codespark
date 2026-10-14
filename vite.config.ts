import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Read version info for client-side comparison
let buildInfo = {
  version: 'v1.3.0',
  commit: 'live',
  message: 'Latest release build',
  buildTime: Date.now(),
  releaseDate: new Date().toISOString(),
};

try {
  const versionPath = path.resolve(__dirname, 'public/version.json');
  if (fs.existsSync(versionPath)) {
    buildInfo = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  }
} catch {
  // fallback
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __BASE_PATH__: '"/"',
    __APP_BUILD_INFO__: JSON.stringify(buildInfo),
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

