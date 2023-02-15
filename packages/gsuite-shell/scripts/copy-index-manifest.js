#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const indexHtmlPath = require.resolve('gsuite-shell/index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, { encoding: 'utf-8' });
const tpl = _.template(indexHtml);

const host = process.env.HOST;
if (!host) {
  throw new Error('Please provide script hostname');
}
const targetIndexHtml = tpl({ appUrl: host });

const targetDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

fs.writeFileSync(path.join(targetDir, 'index.html'), targetIndexHtml);
console.log('Created index.html inside "dist"');

const manifestPath = require.resolve('gsuite-shell/appsscript.json');
fs.copyFileSync(manifestPath, path.join(targetDir, 'appsscript.json'));
console.log('Copied appsscript.json inside "dist"');
