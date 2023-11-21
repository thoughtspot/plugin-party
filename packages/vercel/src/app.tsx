import React from 'preact';
import { VercelTSInit } from 'vercel-ts-init/src/index';
import { useState, useEffect } from 'preact/hooks';
import { createMemoryHistory } from 'history';
import Router, { useRouter, route } from 'preact-router';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { I18N } from 'i18n';
import { Stepper } from 'widgets/lib/stepper';
import { useLoader } from 'widgets/lib/loader';
import { SelectProject } from './components/select-project/select-project';
import { Routes, steps } from './components/connection/connection-utils';
import { FullEmbed } from './components/full-app/full-app';
import { SelectTables } from './components/select-tables/select-tables';
import { DocsPage } from './components/docs-page/docs-page';
import { NextPage } from './components/next-page/next-page';
import styles from './app.module.scss';
import { AppContextProvider } from './app.context';
import { TrustedAuthPage } from './components/trusted-auth-page/trusted-auth-page';
import { getCurrentUserInfo, getVercelAccessToken } from './service/vercel-api';
import { SummaryPage } from './components/summary-page/summary-page';

window.resizeTo(window.screen.width, window.screen.height);

export const App = () => {
  const loader = useLoader();
  loader.hide();
  const history: any = createMemoryHistory();
  const [router] = useRouter();
  const [vercelAccessToken, setVercelAccessToken] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const currentRouteIndex = Object.values(Routes).indexOf(router.path);
  const url = window.location.search;
  const searchParams = url.split('?');
  const addedSearchParam = new URLSearchParams(searchParams[1]);
  const clusterId = addedSearchParam.get('clusterUrl');
  const worksheetId = addedSearchParam.get('worksheetId');
  const deploymentUrlSearchParam = new URLSearchParams(searchParams[2]);
  const deploymentUrl = deploymentUrlSearchParam.get('deployment-url');
  const [clusterUrl, setClusterUrl] = useState<any>({
    url: deploymentUrl ? clusterId : '',
    isCandidate: !deploymentUrl,
    suggestedUrl: '',
  });
  if (deploymentUrl && currentRouteIndex !== 8) {
    route(Routes.TRUSTED_AUTH_PAGE);
  }
  useEffect(() => {
    if (!deploymentUrl) {
      getVercelAccessToken()
        .then((res) => {
          setVercelAccessToken(res);
          getCurrentUserInfo(res)
            .then((response) => {
              const companyName = response.user.email
                .split('@')[1]
                .split('.')[0];
              const suggestedUrl =
                companyName === 'thoughtspot'
                  ? 'https://champagne-grapes.thoughtspotdev.cloud/'
                  : `https://${companyName}.thoughtspot.cloud`;
              setClusterUrl({
                url: clusterUrl.url,
                isCandidate: clusterUrl.isCandidate,
                suggestedUrl,
              });
              setIsLoading(false);
            })
            .catch((err) => {
              console.log('err', err);
              setIsLoading(false);
            });
        })
        .catch((err) => {
          setIsLoading(false);
          console.log('error', err);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>Loading...</h1>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <I18N>
      <VercelTSInit setClusterUrl={setClusterUrl} clusterUrl={clusterUrl}>
        <Horizontal spacing="c" className={styles.docsContainer}>
          <AppContextProvider>
            <Router history={history}>
              <SelectProject
                hostUrl={clusterUrl}
                vercelAccessToken={vercelAccessToken}
                path={Routes.SELECT_PAGE}
              />
              <FullEmbed hostUrl={clusterUrl} path={Routes.APP_EMBED} />
              <SelectTables path={Routes.OPTIONS} />
              <DocsPage
                hostUrl={clusterUrl}
                vercelToken={vercelAccessToken}
                path={Routes.DOCUMENTS}
              />
              <NextPage
                hostUrl={clusterUrl}
                vercelToken={vercelAccessToken}
                path={Routes.NEXT_PAGE}
              />
              <TrustedAuthPage
                hostUrl={clusterUrl}
                worksheetId={worksheetId}
                deploymentUrl={deploymentUrl}
                path={Routes.TRUSTED_AUTH_PAGE}
              />
              <SummaryPage
                hostUrl={clusterUrl}
                worksheetId={worksheetId}
                deploymentUrl={deploymentUrl}
                path={Routes.SUMMARY_PAGE}
              />
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
