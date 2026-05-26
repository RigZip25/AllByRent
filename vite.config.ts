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
      // "prompt" keeps the new SW waiting until the user confirms in-app (bell notification).
      registerType: 'prompt',
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'AllByRent',
        short_name: 'AllByRent',
        description: 'The Social Rental Network',
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
        navigateFallback: '/index.html',
        skipWaiting: false,
        clientsClaim: true,
      },
      devOptions: { enabled: true },
    })
  } catch {
    console.warn(
      '[AllByRent] vite-plugin-pwa not installed — run: npm install -D vite-plugin-pwa',
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
  // HTTPS only when VITE_DEV_HTTPS=true (Safari on iPhone blocks self-signed IP certs).
  const useHttps = process.env.VITE_DEV_HTTPS === 'true'
  const githubRepo =
    process.env.GITHUB_REPOSITORY?.split('/')[1] ??
    process.env.VITE_GITHUB_PAGES_REPO ??
    'v0-allbyrent-app-design'
  const base =
    process.env.GITHUB_PAGES === 'true' ? `/${githubRepo}/` : '/'

  return {
  base,
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
      '/anthropic-api': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/anthropic-api/, ''),
        headers: {
          'x-api-key': env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'prompt-caching-2024-07-31',
        },
      },
    },
  },
  }
})
