import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import preact from '@preact/preset-vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), basicSsl()],
  root: 'src/ui',
  server: {
    https: true,
  },
  build: {
    outDir: path.join(__dirname, 'build'),
    write: true,
  },
});
