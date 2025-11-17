import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',          // karena root project normal
      filename: 'sw.js',      // sw ada di: /src/sw.js
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        // manifest tetap seperti sebelumnya...
      },
      devOptions: {
        enabled: false,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
      }
    })
  ]
});
