import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kololec.cz',
  output: 'static',
  build: {
    format: 'file',
  },
});
