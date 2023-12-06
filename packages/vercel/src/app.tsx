import React from 'preact';
import { VercelTSInit } from 'vercel-ts-init/src/index';
import { createMemoryHistory } from 'history';
import Router, { useRouter, route } from 'preact-router';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { I18N, useTranslations } from 'i18n';
import { Stepper } from 'widgets/lib/stepper';
import { useLoader } from 'widgets/lib/loader';
import { CircularLoader } from 'widgets/lib/circular-loader';
import { Header } from 'widgets/lib/header';
import { useEffect, useState } from 'preact/hooks';
import { SelectProject } from './components/select-project/select-project';
import { Routes, steps } from './components/connection/connection-utils';
import { FullEmbed } from './components/full-app/full-app';
import { SelectTables } from './components/select-tables/select-tables';
import { DocsPage } from './components/auth-type-none-page/auth-type-none-page';
import { NextPage } from './components/next-page/next-page';
import styles from './app.module.scss';
import { AppContextProvider } from './app.context';
import { TrustedAuthPage } from './components/trusted-auth-page/trusted-auth-page';
import { getCurrentUserInfo, getVercelAccessToken } from './service/vercel-api';
import { SummaryPage } from './components/summary-page/summary-page';

// Resize the window to its initial size
const width = Math.min(window.screen.width, 1280);
const height = Math.min(window.screen.height, 790);
window.innerWidth = width;
window.innerHeight = height;
window.resizeTo(width, height);

export const App = () => {
  const { t } = useTranslations();
  const loader = useLoader();
  loader.hide();

  const history = createMemoryHistory();
  const [router] = useRouter();
  const [vercelAccessToken, setVercelAccessToken] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('');
  const currentRouteIndex = Object.values(Routes).indexOf(router.path);

  // Extracting query parameters from the URL
  const url = window.location.search;
  const searchParams = url.split('?');
  const addedSearchParam = new URLSearchParams(searchParams[1]);
  const configurationId = addedSearchParam.get('configurationId');
  const code = addedSearchParam.get('code');
  let TSClusterId = addedSearchParam.get('clusterUrl');
  const worksheetId = addedSearchParam.get('worksheetId');
  const deploymentUrlSearchParam = new URLSearchParams(searchParams[2]);
  let deploymentUrl = deploymentUrlSearchParam.get('deployment-url');

  // Creating broadcast channel to interact with the new tab
  // opened when we open vercel deploy page on a new tab
  const bc = new BroadcastChannel('test_channel');

  // This is done to redirect to summary page when integration is
  // completed and user clicks on configure button at the page
  // which comes up after the integration is successful
  if (configurationId && !code) {
    deploymentUrl = localStorage.getItem('deploymentUrl') || '';
    setRedirectUrl(deploymentUrl);
    TSClusterId = localStorage.getItem('clusterUrl');
    route(Routes.SUMMARY_PAGE);
  }

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
    if (deploymentUrl && worksheetId) {
      bc.postMessage(window.location.href);
      window.close();
    } else if (code) {
      bc.onmessage = (event) => {
        setRedirectUrl(event.data);
        route(Routes.TRUSTED_AUTH_PAGE);
      };
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <CircularLoader loadingText={t.LOADING}></CircularLoader>;
  }

  return (
    <I18N>
      <VercelTSInit setClusterUrl={setClusterUrl} clusterUrl={clusterUrl}>
        <Header
          headerTitle={t.HEADER_TITLE}
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
                deploymentUrl={redirectUrl}
                path={Routes.TRUSTED_AUTH_PAGE}
              />
              <SummaryPage
                hostUrl={clusterUrl}
                deploymentUrl={redirectUrl}
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
