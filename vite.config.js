import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: { proxy: { "/api": "http://localhost:3000" } },
  preview: { proxy: { "/api": "http://localhost:3000" } },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Spotlight",
        short_name: "Spotlight",
        description: "Berita terkini yang ringkas dan jelas.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0B0707",
        theme_color: "#0B0707",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\/(articles|bookmarks)/,
            method: "GET",
            handler: "NetworkFirst",
            options: {
              cacheName: "spotlight-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 60, maxAgeSeconds: 86400 },
            },
          },
          {
            // Foto berita yang diunggah ke Supabase Storage, tetap tampil saat offline
            urlPattern: /\/storage\/v1\/object\/public\/article-images\//,
            handler: "CacheFirst",
            options: {
              cacheName: "spotlight-photos",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
            },
          },
        ],
      },
    }),
  ],
});
