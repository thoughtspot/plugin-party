import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import preact from '@preact/preset-vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

function getPort(host) {
  if (!host) {
    return 5173;
  }
  return Number.parseInt(new URL(host).port, 10);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), basicSsl()],
  root: 'src/ui',
  server: {
    https: true,
    port: getPort(process.env.HOST),
  },
  build: {
    outDir: path.join(__dirname, 'build'),
    write: true,
  },
});
