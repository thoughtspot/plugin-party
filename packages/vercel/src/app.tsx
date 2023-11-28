import React from 'preact';
import { VercelTSInit } from 'vercel-ts-init/src/index';
import { createMemoryHistory } from 'history';
import Router, { useRouter, route } from 'preact-router';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { I18N, useTranslations } from 'i18n';
import { Stepper } from 'widgets/lib/stepper';
import { useLoader } from 'widgets/lib/loader';
import { Header } from 'widgets/lib/header';
import { useEffect, useState } from 'preact/hooks';
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

// Resize the window to its initial size
window.resizeTo(window.screen.width, window.screen.height);

export const App = () => {
  const { t } = useTranslations();
  const loader = useLoader();
  loader.hide();

  const history = createMemoryHistory();
  const [router] = useRouter();
  const [vercelAccessToken, setVercelAccessToken] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const currentRouteIndex = Object.values(Routes).indexOf(router.path);

  // Extracting query parameters from the URL
  const url = window.location.search;
  const searchParams = url.split('?');
  const addedSearchParam = new URLSearchParams(searchParams[1]);
  const TSClusterId = addedSearchParam.get('clusterUrl');
  const worksheetId = addedSearchParam.get('worksheetId');
  const deploymentUrlSearchParam = new URLSearchParams(searchParams[2]);
  const deploymentUrl = deploymentUrlSearchParam.get('deployment-url');
  const domain = deploymentUrl?.split('-') || [];
  const domainUrl = `${domain[0]}-${domain[2]}`;

  const [clusterUrl, setClusterUrl] = useState({
    url: deploymentUrl ? TSClusterId : '',
    isCandidate: !deploymentUrl,
    suggestedUrl: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!deploymentUrl) {
          const res = await getVercelAccessToken();
          setVercelAccessToken(res);
          const response = await getCurrentUserInfo(res);
          const companyName = response.user.email.split('@')[1].split('.')[0];
          const suggestedUrl =
            companyName === 'thoughtspot'
              ? 'https://champagne-grapes.thoughtspotdev.cloud/'
              : `https://${companyName}.thoughtspot.cloud`;
          setClusterUrl({
            url: clusterUrl.url,
            isCandidate: clusterUrl.isCandidate,
            suggestedUrl,
          });
        }
      } catch (err) {
        console.log('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Redirect if deploymentUrl is present and the current route is not the trusted auth page
  if (deploymentUrl && Object.values(Routes).indexOf(router.path) !== 8) {
    route(Routes.TRUSTED_AUTH_PAGE);
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>{t.LOADING}</h1>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <I18N>
      <VercelTSInit setClusterUrl={setClusterUrl} clusterUrl={clusterUrl}>
        <Header
          headerTitle="Thoughtspot Integration"
          headerLogoPath="TS-white-logo"
        ></Header>
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
                deploymentUrl={domainUrl}
                path={Routes.TRUSTED_AUTH_PAGE}
              />
              <SummaryPage
                hostUrl={clusterUrl}
                worksheetId={worksheetId}
                deploymentUrl={domainUrl}
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
