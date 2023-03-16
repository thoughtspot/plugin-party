import './app.scss';
import { useEffect, useState } from 'preact/hooks';
import Router from 'preact-router';
import { ShellContext, defaultShellContextOptions } from 'gsuite-shell';
import { I18N } from 'i18n';
import { TSInit } from 'ts-init';
import { Routes } from '../routes';
import { Home } from './home/home';
import { ListPage } from './listPage/listPage';
import { Liveboard } from './liveboard/liveboard';
import { Answer } from './answer/answer';
import { Header } from './header/header';

export function App() {
  return (
    <I18N>
      <ShellContext.Provider value={defaultShellContextOptions}>
        <TSInit>
          <Header></Header>
          <Router>
            <Home path={Routes.HOME} />
            <ListPage path={Routes.LIST} />
            <Liveboard path={Routes.LIVEBOARD} />
            <Answer path={Routes.ANSWER} />
          </Router>
        </TSInit>
      </ShellContext.Provider>
    </I18N>
  );
}
