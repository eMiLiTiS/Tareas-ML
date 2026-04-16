import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon_16_out.png',
        'favicon_32_out.png',
        'apple_touch_icon_out.png'
      ],
      manifest: {
        name: 'Espacio María Luján · Tareas',
        short_name: 'Tareas ML',
        description: 'Gestión interna de tareas, pacientes y citas',
        theme_color: '#f43f5e',
        background_color: '#fafaf9',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon_192_out.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon_512_out.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
      },
    }),
  ],
})
