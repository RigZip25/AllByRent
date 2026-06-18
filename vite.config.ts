import { createRequire } from 'node:module'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const require = createRequire(import.meta.url)

let pwaEnabled = false

function pwaPlugin() {
  try {
    const { VitePWA } = require('vite-plugin-pwa') as typeof import('vite-plugin-pwa')
    pwaEnabled = true
    return VitePWA({
      // Auto-activate new SW and reload so deploys reach phones without manual cache clear.
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Evorios',
        short_name: 'Evorios',
        description: 'Garage Showcase — evolve how your home shares.',
        theme_color: '#0D5C3A',
        background_color: '#062a1c',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        importScripts: ['push-sw.js'],
        navigateFallback: '/index.html',
        // Activate new SW quickly; BUILD_ID mismatch still forces a shell refresh in-app.
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'allbyrent-html',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache cheap GET requests (maps/geocode) to avoid repeated paid/slow calls.
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://nominatim.openstreetmap.org' ||
              url.origin === 'https://geocoding.geo.census.gov',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'allbyrent-api-get',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache remote images (e.g. externally-linked manuals/screenshots).
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'allbyrent-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache remote PDFs and media when allowed (best-effort).
          {
            urlPattern: ({ request }) =>
              request.destination === 'document' || request.destination === 'video',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'allbyrent-attachments',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 14 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    })
  } catch {
    console.warn(
      '[Evorios] vite-plugin-pwa not installed — run: npm install -D vite-plugin-pwa',
    )
    return null
  }
}


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appBuildId =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.VERCEL_DEPLOYMENT_ID?.slice(0, 12) ??
    (mode === 'production' ? 'unknown' : 'dev')
  const appBuildTime = new Date().toISOString()
  // HTTPS only when VITE_DEV_HTTPS=true (Safari on iPhone blocks self-signed IP certs).
  const useHttps = process.env.VITE_DEV_HTTPS === 'true'
  const githubRepo =
    process.env.GITHUB_REPOSITORY?.split('/')[1] ??
    process.env.VITE_GITHUB_PAGES_REPO ??
    'Evorios'
  const base =
    process.env.GITHUB_PAGES === 'true' ? `/${githubRepo}/` : '/'

  return {
  base,
  define: {
    'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(appBuildId),
    'import.meta.env.VITE_APP_BUILD_TIME': JSON.stringify(appBuildTime),
  },
  plugins: [
    ...(useHttps ? [basicSsl()] : []),
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    pwaPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ...(pwaEnabled
        ? {}
        : {
            'virtual:pwa-register': path.resolve(
              __dirname,
              './src/lib/pwaRegisterStub.ts',
            ),
          }),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    host: true,
    port: 5173,
    proxy: {
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
      },
      '/us-geocode': {
        target: 'https://geocoding.geo.census.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/us-geocode/, '/geocoder'),
      },
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/v1/messages',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'prompt-caching-2024-07-31',
        },
      },
      '/api/photoroom': {
        target: 'https://image-api.photoroom.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/v2/edit',
        headers: {
          'x-api-key': env.PHOTOROOM_API_KEY || env.VITE_PHOTOROOM_API_KEY || '',
        },
      },
    },
  },
  }
})
