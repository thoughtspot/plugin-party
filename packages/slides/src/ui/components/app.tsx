import Router from 'preact-router';
import { createMemoryHistory, createHashHistory } from 'history';
import { ShellContext, defaultShellContextOptions } from 'gsuite-shell';
import { I18N } from 'i18n';
import { TSInit } from 'ts-init';
import React from 'preact';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Routes } from '../routes';
import { Home } from './home/home';
import { ListPage } from './listPage/listPage';
import { Liveboard, PrerenderdLiveboardProvider } from './liveboard/liveboard';
import { Answer } from './answer/answer';
import { Header } from './header/header';
import { AppContextProvider } from './app.context';
import styles from './app.module.scss';

const history: any = createMemoryHistory();

export function App() {
  return (
    <I18N>
      <ShellContext.Provider value={defaultShellContextOptions}>
        <TSInit>
          <Header history={history}></Header>
          <div className={styles.content}>
            <AppContextProvider>
              <PrerenderdLiveboardProvider>
                <Router history={history}>
                  <Home path={Routes.HOME} />
                  <ListPage path={Routes.LIST} />
                  <Liveboard path={Routes.LIVEBOARD} />
                  <Answer path={Routes.ANSWER} />
                </Router>
              </PrerenderdLiveboardProvider>
            </AppContextProvider>
          </div>
        </TSInit>
      </ShellContext.Provider>
    </I18N>
  );
}
