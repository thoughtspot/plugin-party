import './app.scss';
import { useEffect, useState } from 'preact/hooks';
import {
  useShellContext,
  ShellContext,
  defaultShellContextOptions,
} from 'gsuite-shell';
import { I18N } from 'i18n';
import { TSInit } from 'ts-init';
import { TSSearchBar } from './search-bar/search-bar';

export function App() {
  const [label, setLabel] = useState('Hello World 123');

  return (
    <I18N>
      <ShellContext.Provider value={defaultShellContextOptions}>
        <TSInit>
          <TSSearchBar />
        </TSInit>
      </ShellContext.Provider>
    </I18N>
  );
}
