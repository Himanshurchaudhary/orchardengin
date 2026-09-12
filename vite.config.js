import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
    react(),
    sitemap({
      hostname: 'https://theorchardengine.com',  // ← apna domain yahan lagao
      dynamicRoutes: [
        '/',
        '/user/product',
        '/user/blog',
        '/user/contect',
        '/user/about',
        '/user/termcondition',
        '/user/privacy',
        '/user/deleteaccount',
        '/forgot-password',
        '/user/categories',
      ]
    })
  ],
})