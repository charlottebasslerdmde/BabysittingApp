
import path from 'path';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public');
const BUILD_DIR = path.resolve(__dirname, './www');
export default async () => {

  return  {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'SitterSafe',
          short_name: 'SitterSafe',
          description: 'Babysitting App für sichere Betreuung',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'icons/192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'icons/512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        },
      }),
    ],
    root: SRC_DIR,
    base: '',
    publicDir: PUBLIC_DIR,
    build: {
      outDir: BUILD_DIR,
      assetsInlineLimit: 0,
      emptyOutDir: true,
      rollupOptions: {
        treeshake: false,
      },
    },
    resolve: {
      alias: {
        '@': SRC_DIR,
      },
    },
    server: {
      host: true,
    },

  };
}
