import React, { useEffect, useState } from 'preact/compat';
import { Button } from 'widgets/lib/button';
import { RiFileCopy2Line } from 'react-icons/ri';
import { useTranslations } from 'i18n';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import {
  uploadMixpanelEvent,
  MIXPANEL_EVENT,
} from '@thoughtspot/visual-embed-sdk/src/mixpanel-service';
import { TfiAngleRight, TfiAngleDown } from 'react-icons/tfi';
import { CircularLoader } from 'widgets/lib/circular-loader';
import { message } from 'antd';
import styles from './summary-page.module.scss';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { EmbedTemplates } from '../auth-type-none-page/embed-code-templates';
import { getUserName } from '../../service/ts-api';
import { generateStackblitzURL } from '../auth-type-none-page/docs-utils';

export const SummaryPage = ({ hostUrl, deploymentUrl }) => {
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [userName, setUserName] = useState();
  const [expandedHeading, setExpandedHeading] = useState<number>(-1);
  const { t } = useTranslations();

  const searchParams = deploymentUrl.split('?');
  const addedSearchParam = new URLSearchParams(searchParams[1]);
  const worksheetId = addedSearchParam.get('worksheetId');
  const deploymentUrlSearchParam = new URLSearchParams(searchParams[2]);
  const deploymentUrls = deploymentUrlSearchParam.get('deployment-url') || '';
  const deploymentDashboardUrl =
    deploymentUrlSearchParam.get('deployment-dashboard-url') || '';
  const url = window.location.search.split('?');
  const configuration = new URLSearchParams(url[1]);
  const configurationId = configuration.get('configurationId');
  const code = configuration.get('code');
  const vercelParams =
    'env=REACT_APP_TS_HOST,REACT_APP_AUTH_SERVICE_URL,REACT_APP_TS_USER_NAME,REACT_APP_TS_ORG_ID&repository-url=https%3A%2F%2Fgithub.com%2Fthoughtspot%2Fthoughtspot-demo-app';

  const toggleAccordion = (index: number) => {
    if (expandedHeading === index) {
      setExpandedHeading(-1);
    } else {
      setExpandedHeading(index);
    }
  };

  if ((configurationId && code) || localStorage.getItem('worksheetId')) {
    localStorage.setItem('clusterUrl', tsHostURL);
    localStorage.setItem('deploymentUrl', deploymentUrl);
  }
  localStorage.setItem('isDocsPage', 'false');
  const currentOrgId =
    localStorage.getItem('currentOrgId') ||
    addedSearchParam.get('currentOrgId');

  const codeMap = {
    SageEmbed: EmbedTemplates.TrustedAuthSageEmbed(
      tsHostURL,
      worksheetId,
      deploymentUrls,
      userName,
      currentOrgId
    ),
  };
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserName(tsHostURL)
      .then((res) => {
        setUserName(res.userName);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('err', error);
        setErrorMessage({ visible: true, message: t.TS_USER_ERROR });
        setIsLoading(false);
      });
  }, []);

  const isVercelIntegrationCompleted = localStorage.getItem(
    'vercelIntegrationCompleted'
  );

  const handleClick = () => {
    const demoAppUrl = `https://vercel.com/new/clone?${vercelParams}`;
    window.open(demoAppUrl, '_blank');
  };

  const openThoughtSpotURL = () => {
    window.open(tsHostURL, '_blank');
  };

  const closeVercelModal = () => {
    // uploadMixpanelEvent(MIXPANEL_EVENT.VERCEL_INTEGRATION_COMPLETED);
    localStorage.setItem('vercelIntegrationCompleted', 'true');
    window.location.href =
      new URLSearchParams(window.location.search).get('next') || '';
  };

  const tableData = [
    { col1: 'REACT_APP_TS_HOST', col2: tsHostURL },
    { col1: 'REACT_APP_AUTH_SERVICE_URL', col2: deploymentUrls },
    { col1: 'REACT_APP_TS_USER_NAME', col2: userName },
    { col1: 'REACT_APP_TS_ORG_ID', col2: currentOrgId },
  ];

  const handleStackblitzURL = () => {
    generateStackblitzURL(codeMap.SageEmbed);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Text copied to clipboard');
  };

  const subHeading = [
    t.SUMMARY_PAGE_FIRST_HEADING,
    t.SUMMARY_PAGE_SECOND_HEADING,
    t.SUMMARY_PAGE_THIRD_HEADING,
  ];

  const showSubHeading = () => {
    return (
      <>
        {subHeading.map((heading: string, index: number) => (
          <>
            <Horizontal
              onClick={() => toggleAccordion(index)}
              className={styles.subHeadingWrapper}
            >
              <Typography variant="h4" className={styles.subHeading}>
                {heading}
              </Typography>
              {expandedHeading === index ? (
                <TfiAngleDown size={24} style={{ paddingTop: '20px' }} />
              ) : (
                <TfiAngleRight size={24} style={{ paddingTop: '20px' }} />
              )}
            </Horizontal>
            {expandedHeading === 0 && index === 0 && (
              <>
                <Typography variant="p" noMargin className={styles.textWrapper}>
                  {t.SUMMARY_PAGE_FIRST_SUBHEADING}
                </Typography>
                <ol className={styles.listWrapper}>
                  <li>
                    <Typography variant="p" noMargin>
                      {t.SUMMARY_PAGE_SUBTEXT}
                      <div
                        className={styles.codeStyle}
                        role="button"
                        onClick={handleStackblitzURL}
                      >
                        code
                      </div>
                      {t.SUMMARY_PAGE_SECOND_SUBTEXT}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="p" noMargin>
                      {t.SUMMARY_PAGE_SECOND_SUBHEADING}
                    </Typography>
                  </li>
                  <ol type="a">
                    <li>
                      <Typography variant="p" noMargin>
                        {t.SUMMARY_PAGE_FIRST_POINT}
                        <a href={deploymentUrls} target="_blank">
                          {deploymentUrls}
                        </a>
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="p" noMargin>
                        {t.SUMMARY_PAGE_SECOND_POINT}
                        <a href={deploymentDashboardUrl} target="_blank">
                          {deploymentDashboardUrl}
                        </a>
                      </Typography>
                    </li>
                  </ol>
                </ol>
                <Typography variant="p" noMargin>
                  {t.SUMMARY_PAGE_FIRST_NOTE}
                </Typography>
                <Typography
                  variant="p"
                  noMargin
                  htmlContent={t.SUMMARY_PAGE_DOCUMENTATION}
                ></Typography>
              </>
            )}
            {expandedHeading === 1 && index === 1 && (
              <>
                <Typography variant="p" noMargin className={styles.textWrapper}>
                  {t.VERCEL_DEMO_APP}
                </Typography>
                <Vertical
                  className={styles.buttonContainer}
                  hAlignContent="center"
                >
                  <Button onClick={handleClick} type="SECONDARY">
                    {t.DEMO_APP_BUTTON}
                  </Button>
                </Vertical>
                <Typography variant="h4" className={styles.description}>
                  {t.SUMMARY_PAGE_VARIABLES_HEADING}
                </Typography>
                <Typography variant="p">
                  {t.SUMMARY_PAGE_VARIABLES_DESCRIPTION}
                </Typography>
                <table className={styles['custom-table']}>
                  <tbody>
                    {tableData.map((row) => (
                      <tr>
                        <td>{row.col1}</td>
                        <td>{row.col2}</td>
                        <td>
                          <button onClick={() => copyToClipboard(row.col2)}>
                            <RiFileCopy2Line />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {expandedHeading === 2 && index === 2 && (
              <>
                <Typography variant="p" noMargin className={styles.textWrapper}>
                  {t.SUMMARY_PAGE_THIRD_SUBHEADING}
                </Typography>
                <Vertical
                  className={styles.buttonContainer}
                  hAlignContent="center"
                >
                  <Button onClick={openThoughtSpotURL} type="SECONDARY">
                    {t.CLUSTER_URL_BUTTON}
                  </Button>
                </Vertical>
                <Typography
                  variant="p"
                  className={styles.textWrapper}
                  htmlContent={t.SUMMARY_PAGE_THIRD_DOCUMENTATION}
                ></Typography>
              </>
            )}
          </>
        ))}
      </>
    );
  };

  if (isLoading) {
    return <CircularLoader loadingText={t.LOADING}></CircularLoader>;
  }

  return (
    <Vertical className={styles.pageWrapper}>
      <ErrorBanner
        errorMessage={errorMessage.message}
        bannerType={BannerType.MESSAGE}
        errorCardButton={{
          name: '',
        }}
        showCloseIcon={false}
        showBanner={errorMessage.message !== '' && errorMessage.visible}
      />
      <Typography variant="h2" className={styles.heading}>
        {t.SUMMARY_PAGE_HEADING}
      </Typography>
      <Typography variant="p" className={styles.description}>
        {t.SUMMARY_PAGE_DESCRIPTION}
      </Typography>
      {showSubHeading()}
      {isVercelIntegrationCompleted !== 'true' && (
        <Vertical className={styles.buttonWrapper} hAlignContent="center">
          <Button onClick={closeVercelModal} text={t.FINISH_SETUP} />
        </Vertical>
      )}
    </Vertical>
  );
};
