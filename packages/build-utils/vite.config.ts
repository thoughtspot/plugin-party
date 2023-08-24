/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';
import fs from 'fs';

function getPort(host) {
  if (!host) {
    return 5173;
  }
  return Number.parseInt(new URL(host).port, 10);
}
const iconSprite = fs.readFileSync(
  require.resolve('icons/lib/icon-sprite.svg'),
  'utf8'
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    basicSsl(),
    createHtmlPlugin({
      minify: true,
      template: 'index.html',
      entry: 'src/ui/index.tsx',
      inject: {
        data: {
          iconSprite,
        },
      },
    }),
  ],
  server: {
    https: true,
    port: getPort(process.env.HOST),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: path.join(process.cwd(), 'build'),
    write: true,
    emptyOutDir: true,
  },
  test: {
    dir: 'src',
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      extension: ['.ts', '.tsx'],
      provider: 'c8',
      all: true,
      clean: true,
      // lines: 70,
    },
  },
});
