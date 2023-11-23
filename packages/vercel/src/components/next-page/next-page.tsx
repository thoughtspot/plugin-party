import React from 'react';
import { useTranslations } from 'i18n';
import styles from './next-page.module.scss';
import { useAppContext } from '../../app.context';
import { formatClusterUrl } from '../full-app/full-app.utils';

export const NextPage = ({ hostUrl, vercelToken }) => {
  const { t } = useTranslations();
  const { worksheetId, selectedProject } = useAppContext();
  const redirectUrl = formatClusterUrl(window.location.href);
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const vercelModalClose =
    new URLSearchParams(window.location.search).get('next') || '';
  const searchParams = new URLSearchParams(window.location.search);
  const teamId = searchParams.get('teamId') || '';

  const vercelParams = `env=TS_HOST,TS_SECRET_KEY&repository-url=https%3A%2F%2Fgithub.com%2Fthoughtspot%2Ftoken-auth-service&redirect-url=${redirectUrl}%2F%3FworksheetId=${worksheetId}%26token=${vercelToken}%26clusterUrl=${tsHostURL}%26project=${selectedProject}%26teamId=${teamId}%26closeVercel=${vercelModalClose}&output-directory=.`;
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.heading}>{t.TRUSTED_AUTH_HEADING}</div>
        <div className={styles.divider}></div>
        <div className={styles.heading}>{t.TRUSTED_AUTH_TEMPLATE_HEADING}</div>
        <p dangerouslySetInnerHTML={{ __html: t.TRUSTED_AUTH_DESCRIPTION }}></p>
        <a href={`https://vercel.com/new/clone?${vercelParams}`}>
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
      </div>
    </div>
  );
};
