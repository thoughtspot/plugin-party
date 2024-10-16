import './app.scss';
import Router from 'preact-router';
import { createMemoryHistory } from 'history';
import { ShellContext, defaultShellContextOptions } from 'gsuite-shell';
import { I18N } from 'i18n';
import { Analytics } from '@vercel/analytics/react';
import { TSInit } from 'ts-init';
import React from 'preact';
import { TSSearchBar } from './search-bar/search-bar';
import { Routes } from '../routes';
import { Home } from './home/home';
import { Header } from './header/header';

const history: any = createMemoryHistory();
export function App() {
  return (
    <I18N>
      <ShellContext.Provider value={defaultShellContextOptions}>
        <TSInit>
          <Header history={history}></Header>
          <Analytics />
          <Router history={history}>
            <Home path={Routes.HOME} />
            <TSSearchBar path={Routes.SEARCHBAR} />
          </Router>
        </TSInit>
      </ShellContext.Provider>
    </I18N>
  );
}
