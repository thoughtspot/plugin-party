import React, { useEffect, useState } from 'preact/compat';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import styles from './summary-page.module.scss';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { EmbedTemplates } from '../auth-type-none-page/embed-code-templates';
import { getUserName } from '../../service/ts-api';
import { generateStackblitzURL } from '../auth-type-none-page/docs-utils';

export const SummaryPage = ({ hostUrl, deploymentUrl }) => {
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [userName, setUserName] = useState();
  const { t } = useTranslations();

  const searchParams = deploymentUrl.split('?');
  const addedSearchParam = new URLSearchParams(searchParams[1]);
  const worksheetId = addedSearchParam.get('worksheetId');
  const deploymentUrlSearchParam = new URLSearchParams(searchParams[2]);
  const deploymentUrls = deploymentUrlSearchParam.get('deployment-url');
  const domain = deploymentUrls?.split('-') || [];
  const domainUrl = `${domain[0]}-${domain[2]}`;
  const url = window.location.search.split('?');
  const configuration = new URLSearchParams(url[1]);
  const configurationId = configuration.get('configurationId');
  const code = configuration.get('code');

  if ((configurationId && code) || localStorage.getItem('worksheetId')) {
    localStorage.setItem('clusterUrl', tsHostURL);
    localStorage.setItem('deploymentUrl', deploymentUrl);
  }
  localStorage.setItem('isDocsPage', 'false');

  const codeMap = {
    SageEmbed: EmbedTemplates.TrustedAuthSageEmbed(
      tsHostURL,
      worksheetId,
      domainUrl,
      userName
    ),
  };
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await getUserName(tsHostURL);
        setUserName(res.name);
      } catch (error) {
        setErrorMessage({ visible: true, message: t.TS_USER_ERROR });
        console.error('err', error);
      }
    };
    fetchUserName();
  }, []);

  const closeVercelModal = () => {
    window.location.href =
      new URLSearchParams(window.location.search).get('next') || '';
  };

  const handleStackblitzURL = () => {
    generateStackblitzURL(codeMap.SageEmbed);
  };

  return (
    <Vertical className={styles.containerStyle}>
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
      <ul>
        <li>
          <Typography variant="p" className={styles.subText}>
            {t.SUMMARY_PAGE_TEXT}
            <div
              role="button"
              onClick={handleStackblitzURL}
              className={styles.codeStyle}
            >
              {t.SUMMARY_PAGE_SUBTEXT}
            </div>
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            {t.SUMMARY_PAGE_DATA_TEXT}
            <a href={tsHostURL} target="_blank">
              {tsHostURL}
            </a>
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            {t.SUMMARY_PAGE_TRUSTED_AUTH_SERVICE}
            <a href={domainUrl} target="_blank">
              {domainUrl}
            </a>
          </Typography>
          <ul>
            <li>
              <Typography variant="p" className={styles.description}>
                {t.SUMMARY_PAGE_AUTHENTICATION_TEXT}
              </Typography>
            </li>
          </ul>
        </li>
      </ul>
      <Typography
        variant="p"
        htmlContent={t.SUMMARY_PAGE_DOCUMENTATION}
      ></Typography>
      <Vertical className={styles.buttonContainer} hAlignContent="center">
        <Button onClick={closeVercelModal} text={t.FINISH_SETUP} />
      </Vertical>
    </Vertical>
  );
};
