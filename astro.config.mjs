// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import remarkResponsiveImages from './src/lib/remark-responsive-images.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://malmqvist.dev',
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkResponsiveImages],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'catppuccin-mocha',
      },
    },
  },
});
