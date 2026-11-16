// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Every page is pre-built as static HTML. The only server code is /api/special,
// which lets Eric post the daily special from his phone.
export default defineConfig({
  site: 'https://chutzpahdeli.com',
  trailingSlash: 'always',
  output: 'static',
  adapter: vercel(),
});
