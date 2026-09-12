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
      hostname: 'https://theorchardengine.com',
      exclude: [
        '/404',
        '/user/deleteaccount',
        '/google662049138711fad3',
      ],
      dynamicRoutes: [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/user/product', changefreq: 'daily', priority: 1.0 },
        { url: '/user/categories', changefreq: 'daily', priority: 1.0 },
        { url: '/user/blog', changefreq: 'daily', priority: 1.0 },
        { url: '/user/about', changefreq: 'monthly', priority: 1.0 },
        { url: '/user/contect', changefreq: 'monthly', priority: 1.0 },
        { url: '/user/termcondition', changefreq: 'monthly', priority: 1.0 },
        { url: '/user/privacy', changefreq: 'monthly', priority: 1.0 },
        { url: '/forgot-password', changefreq: 'monthly', priority: 0.5 },
      ]
    })
  ],
})