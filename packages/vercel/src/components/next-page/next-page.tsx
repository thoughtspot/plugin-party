import React from 'react';
import { useTranslations } from 'i18n';
import { message } from 'antd';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { Button } from 'widgets/lib/button';
import { RiFileCopy2Fill } from 'react-icons/ri';
import styles from './next-page.module.scss';
import { useAppContext } from '../../app.context';
import { formatClusterUrl } from '../full-app/full-app.utils';

export const NextPage = ({ hostUrl, vercelToken }) => {
  const { t } = useTranslations();
  const { worksheetId, selectedProject, secretKey } = useAppContext();
  const redirectUrl = formatClusterUrl(window.location.href);
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const vercelModalClose =
    new URLSearchParams(window.location.search).get('next') || '';
  const searchParams = new URLSearchParams(window.location.search);
  const teamId = searchParams.get('teamId') || '';

  const vercelParams = `env=TS_HOST,TS_SECRET_KEY&repository-url=https%3A%2F%2Fgithub.com%2Fthoughtspot%2Ftoken-auth-service&redirect-url=${redirectUrl}%2F%3FworksheetId=${worksheetId}%26token=${vercelToken}%26clusterUrl=${tsHostURL}%26project=${selectedProject}%26teamId=${teamId}%26closeVercel=${vercelModalClose}&output-directory=.`;

  const openVercelDeployPage = () => {
    window.open(`https://vercel.com/new/clone?${vercelParams}`, '_blank');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Text copied to clipboard');
  };

  return (
    <Vertical className={styles.container}>
      <Typography variant="h1" className={styles.heading}>
        {t.TRUSTED_AUTH_TEMPLATE_HEADING}
      </Typography>
      <Vertical className={styles.container}>
        <Typography
          variant="p"
          htmlContent={t.TRUSTED_AUTH_DESCRIPTION}
          className={styles.description}
        ></Typography>
      </Vertical>
      <Vertical className={styles.noteContainer}>
        <Typography className={styles.noteHeading} variant="h6" noMargin>
          {t.IMPORTANT}
        </Typography>
        <Typography variant="p" noMargin className={styles.noteDescription}>
          {t.COPY_TEXT}
        </Typography>
        <Horizontal>
          <Typography variant="p" className={styles.noteDescription}>
            TS_HOST: {tsHostURL}
          </Typography>
          <RiFileCopy2Fill
            onClick={() => copyToClipboard(tsHostURL)}
            className={styles.copyIcon}
          />
        </Horizontal>
        <Horizontal>
          <Typography variant="p" className={styles.noteText}>
            TS_SECRET_KEY: {secretKey}
          </Typography>
          <RiFileCopy2Fill
            onClick={() => copyToClipboard(secretKey)}
            className={styles.copyIcon}
          />
        </Horizontal>
      </Vertical>
      <Vertical hAlignContent="center">
        <Button
          onClick={openVercelDeployPage}
          text="Deploy Auth Service"
        ></Button>
      </Vertical>
    </Vertical>
  );
};
