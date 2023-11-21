import sdk from '@stackblitz/sdk';
import { EmbedTemplates } from './embed-code-templates';

const codeMap = {
  IndexJS: EmbedTemplates.IndexJS(),
  IndexHTML: EmbedTemplates.IndexHTML(),
  PackageJSON: EmbedTemplates.PackageJSON(),
};

export const generateStackblitzURL = (code) => {
  sdk.openProject(
    {
      title: 'TS Starter',
      description: 'Blank starter project for building ES6 apps.',
      template: 'javascript',
      files: {
        'index.html': codeMap.IndexHTML,
        'index.js': codeMap.IndexJS,
        'style.css': 'body { font-family: system-ui, sans-serif; }',
        'App.js': code,
        'package.json': codeMap.PackageJSON,
      },
      settings: {
        compile: {
          trigger: 'auto',
          clearConsole: false,
        },
      },
    },
    {
      newWindow: true,
      openFile: [
        'index.js',
        'index.html',
        'style.css',
        'app.js',
        'package.json',
      ],
    }
  );
};
