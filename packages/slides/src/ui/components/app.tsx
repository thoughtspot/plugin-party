import './app.scss';
import Router from 'preact-router';
import { ShellContext, defaultShellContextOptions } from 'gsuite-shell';
import { I18N } from 'i18n';
import { TSInit } from 'ts-init';
import React from 'preact';
import { Routes } from '../routes';
import { Home } from './home/home';
import { ListPage } from './listPage/listPage';
import { Liveboard } from './liveboard/liveboard';
import { Answer } from './answer/answer';
import { Header } from './header/header';
import { AppContextProvider } from './app.context';

export function App() {
  return (
    <I18N>
      <ShellContext.Provider value={defaultShellContextOptions}>
        <TSInit>
          <Header></Header>
          <AppContextProvider>
            <Router>
              <Home path={Routes.HOME} />
              <ListPage path={Routes.LIST} />
              <Liveboard path={Routes.LIVEBOARD} />
              <Answer path={Routes.ANSWER} />
            </Router>
          </AppContextProvider>
        </TSInit>
      </ShellContext.Provider>
    </I18N>
  );
}
