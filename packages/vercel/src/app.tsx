import React from 'preact';
import { VercelTSInit } from 'vercel-ts-init/src/index';
import { useState } from 'preact/hooks';
import { createMemoryHistory } from 'history';
import Router, { useRouter } from 'preact-router';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { I18N } from 'i18n';
import { Stepper } from 'widgets/lib/stepper';
import { SelectProject } from './components/select-project/select-project';
import { Routes, steps } from './components/connection/connection-utils';
import { FullEmbed } from './components/full-app/full-app';
import { SelectTables } from './components/select-tables/select-tables';
import { DocsPage } from './components/docs-page/docs-page';
import { NextPage } from './components/next-page/next-page';
import styles from './app.module.scss';
import { AppContextProvider } from './app.context';

export const App = () => {
  const history: any = createMemoryHistory();
  const [router] = useRouter();
  const currentRouteIndex = Object.values(Routes).indexOf(router.path);
  const [clusterUrl, setClusterUrl] = useState<any>({
    url: '',
    isCandidate: true,
  });
  return (
    <I18N>
      <VercelTSInit setClusterUrl={setClusterUrl} clusterUrl={clusterUrl}>
        <Horizontal spacing="e" className={styles.docsContainer}>
          <AppContextProvider>
            <Router history={history}>
              <SelectProject path={Routes.SELECT_PAGE} />
              <FullEmbed hostUrl={clusterUrl} path={Routes.APP_EMBED} />
              <SelectTables path={Routes.OPTIONS} />
              <DocsPage hostUrl={clusterUrl} path={Routes.DOCUMENTS} />
              <NextPage path={Routes.NEXT_PAGE} />
            </Router>
          </AppContextProvider>
          <Vertical hAlignContent="stretch" className={styles.stepper}>
            <Stepper
              currentStep={currentRouteIndex > 0 ? currentRouteIndex : 1}
              steps={steps}
            ></Stepper>
          </Vertical>
        </Horizontal>
      </VercelTSInit>
    </I18N>
  );
};
