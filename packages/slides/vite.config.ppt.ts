/// <reference types="vitest" />
/// <reference types="vite/client" />
import preact from '@preact/preset-vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';
import fs from 'fs';
import config from './vite.config';

const iconSprite = fs.readFileSync(
  require.resolve('icons/lib/icon-sprite.svg'),
  'utf8'
);

const newConfig = {
  ...config,
  root: 'src/ui/ppt',
  base: '/ppt/',
  build: {
    outDir: path.join(process.cwd(), 'build/ppt'),
    write: true,
    emptyOutDir: true,
  },
  plugins: [
    preact(),
    basicSsl(),
    createHtmlPlugin({
      minify: true,
      template: 'index.html',
      entry: 'index.tsx',
      inject: {
        data: {
          iconSprite,
        },
      },
    }),
  ],
};

export default newConfig;
