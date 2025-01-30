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
  plugins: [
    preact(),
    basicSsl(),
    createHtmlPlugin({
      minify: true,
      template: 'powerpoint.html',
      entry: 'powerpoint.tsx',
      inject: {
        data: {
          iconSprite,
        },
      },
    }),
  ],
};

export default newConfig;
