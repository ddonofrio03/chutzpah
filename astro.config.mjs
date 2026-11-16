// @ts-check
import { defineConfig } from 'astro/config';

// Old WordPress URLs that no longer have their own page point to where that content lives now.
export default defineConfig({
  site: 'https://chutzpahdeli.com',
  trailingSlash: 'always',
  redirects: {
    '/menu/': '/catering/',
    '/breakfast/': '/our-menu/#breakfast',
    '/more-stuff/': '/our-menu/#burgers',
    '/beverage-dessert/': '/our-menu/#desserts',
    '/chutzpah-home/': '/',
  },
});
