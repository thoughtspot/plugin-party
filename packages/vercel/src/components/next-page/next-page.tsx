import React from 'react';
import { useTranslations } from 'i18n';
import { message } from 'antd';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { Button } from 'widgets/lib/button';
import { Icon } from 'widgets/lib/icon';
import { useLoader } from 'widgets/lib/loader';
import styles from './next-page.module.scss';
import { useAppContext } from '../../app.context';
import { formatClusterUrl } from '../full-app/full-app.utils';

export const NextPage = ({ hostUrl, vercelToken }) => {
  const { t } = useTranslations();
  const loader = useLoader();
  loader.hide();
  const { worksheetId, secretKey, currentOrgId } = useAppContext();
  const redirectUrl = formatClusterUrl(window.location.href);
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const localStorageWorksheetId =
    localStorage.getItem('worksheetId') || worksheetId;
  const localStorageOrgId =
    localStorage.getItem('currentOrgId') || currentOrgId;

  const vercelParams = `env=TS_HOST,TS_SECRET_KEY&repository-url=https%3A%2F%2Fgithub.com%2Fthoughtspot%2Ftoken-auth-service&output-directory=.&redirect-url=${redirectUrl}%2F%3FworksheetId=${localStorageWorksheetId}%26currentOrgId=${localStorageOrgId}`;

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
        <Horizontal className={styles.textWrapper}>
          <Typography variant="p" className={styles.noteTitle} noMargin>
            TS_HOST
          </Typography>
          <Typography
            variant="p"
            className={styles.noteDescriptionText}
            noMargin
          >
            <input
              className={styles.noteText}
              value={tsHostURL}
              readOnly
              disabled={true}
            ></input>
          </Typography>
          <Horizontal className={styles.icon}>
            <Icon
              name="rd-icon-copy"
              size="s"
              onClick={() => copyToClipboard(tsHostURL)}
            ></Icon>
          </Horizontal>
        </Horizontal>
        <Horizontal className={styles.textWrapper}>
          <Typography variant="p" className={styles.noteTitle} noMargin>
            TS_SECRET_KEY
          </Typography>
          <input
            className={styles.noteText}
            value={secretKey}
            readOnly
            disabled={true}
          ></input>
          <Horizontal className={styles.icon}>
            <Icon
              name="rd-icon-copy"
              size="s"
              onClick={() => copyToClipboard(secretKey)}
            ></Icon>
          </Horizontal>
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
