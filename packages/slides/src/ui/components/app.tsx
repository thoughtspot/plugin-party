import './app.scss';
import { useEffect, useState } from 'preact/hooks';
import { ShellContext, defaultShellContextOptions } from 'gsuite-shell';
import { I18N } from 'i18n';
import { TSInit } from 'ts-init';
import { Home } from './home/home';

export function App() {
  return (
    <I18N>
      <ShellContext.Provider value={defaultShellContextOptions}>
        <TSInit>
          <Home />
        </TSInit>
      </ShellContext.Provider>
    </I18N>
  );
}
