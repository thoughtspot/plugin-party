import React, { useEffect, useState } from 'preact/compat';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import styles from './summary-page.module.scss';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { EmbedTemplates } from '../docs-page/embed-code-templates';
import { getUserName } from '../../service/ts-api';
import { generateStackblitzURL } from '../docs-page/docs-utils';

export const SummaryPage = ({ hostUrl, worksheetId, deploymentUrl }) => {
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [userName, setUserName] = useState();
  const { t } = useTranslations();
  const codeMap = {
    SageEmbed: EmbedTemplates.TrustedAuthSageEmbed(
      tsHostURL,
      worksheetId,
      deploymentUrl,
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

  const closeVercelModal = async () => {
    window.location.href =
      new URLSearchParams(window.location.search.split('?')[1]).get(
        'closeVercel'
      ) || '';
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
      <Typography variant="h2">{t.SUMMARY_PAGE_HEADING}</Typography>
      <Typography variant="p">{t.SUMMARY_PAGE_DESCRIPTION}</Typography>
      <ul>
        <li>
          <Typography variant="p">
            {t.SUMMARY_PAGE_TEXT}
            <div
              role="button"
              onClick={handleStackblitzURL}
              className={styles.codeStyle}
            >
              code
            </div>
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            {t.SUMMARY_PAGE_DATA_TEXT}
            <a href={tsHostURL} target="_blank">
              ThoughtSpot cluster
            </a>
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            {t.SUMMARY_PAGE_TRUSTED_AUTH_SERVICE}
          </Typography>
        </li>
      </ul>
      <Typography
        variant="p"
        htmlContent={t.SUMMARY_PAGE_DOCUMENTATION}
      ></Typography>
      <Vertical className={styles.buttonContainer} hAlignContent="start">
        <Button onClick={closeVercelModal} text={t.FINISH_SETUP} />
      </Vertical>
    </Vertical>
  );
};
