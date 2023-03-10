import './app.scss';
import { useEffect, useState } from 'preact/hooks';
import Router from 'preact-router';
import { ShellContext, defaultShellContextOptions } from 'gsuite-shell';
import { I18N } from 'i18n';
import { TSInit } from 'ts-init';
import { Routes } from '../routes';
import { Home } from './home/home';
import { ListPage } from './listPage/listPage';

export function App() {
  return (
    <I18N>
      <ShellContext.Provider value={defaultShellContextOptions}>
        <TSInit>
          <Router>
            <Home path={Routes.HOME} />
            <ListPage path={Routes.LIST} />
          </Router>
        </TSInit>
      </ShellContext.Provider>
    </I18N>
  );
}
