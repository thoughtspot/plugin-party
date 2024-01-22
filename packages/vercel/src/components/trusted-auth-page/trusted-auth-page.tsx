import React from 'preact';
import { message } from 'antd';
import { Button } from 'widgets/lib/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslations } from 'i18n';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { CircularLoader } from 'widgets/lib/circular-loader';
import styles from './trusted-auth-page.module.scss';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { EmbedTemplates } from '../auth-type-none-page/embed-code-templates';
import { getUserName } from '../../service/ts-api';
import { saveDeployedUrlEnv } from '../../service/vercel-api';
import { generateStackblitzURL } from '../auth-type-none-page/docs-utils';
import { Routes } from '../connection/connection-utils';

export const TrustedAuthPage = ({ hostUrl, deploymentUrl }) => {
  const { t } = useTranslations();
  const [userName, setUserName] = useState();
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = deploymentUrl.split('?');
  const addedSearchParam = new URLSearchParams(searchParams[1]);
  const worksheetId = addedSearchParam.get('worksheetId');
  const deploymentUrlSearchParam = new URLSearchParams(searchParams[2]);
  const deploymentUrls = deploymentUrlSearchParam.get('deployment-url');

  const codeMap = {
    SageEmbed: EmbedTemplates.TrustedAuthSageEmbed(
      tsHostURL,
      worksheetId,
      deploymentUrls,
      userName
    ),
  };

  useEffect(() => {
    getUserName(tsHostURL)
      .then((res) => {
        setUserName(res.userName);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('err', error);
        setIsLoading(false);
      });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeMap.SageEmbed);
    message.success('Code copied to clipboard');
  };

  const handleOpenStackBlitz = () => {
    const stackblitzURL = generateStackblitzURL(codeMap.SageEmbed);
  };

  const closeVercelModal = async () => {
    await saveDeployedUrlEnv();
    route(Routes.SUMMARY_PAGE);
  };

  if (isLoading) {
    return (
      <CircularLoader
        loadingText={t.TRUSTED_AUTH_PAGE_LOADING}
      ></CircularLoader>
    );
  }

  return (
    <Vertical className={styles.container}>
      <Typography variant="h2" className={styles.heading} noMargin>
        {t.TRUSTED_AUTH_PAGE_HEADING}
      </Typography>
      <Vertical className={styles.noteContainer}>
        <Typography className={styles.noteHeading} variant="h6" noMargin>
          {t.IMPORTANT}
        </Typography>
        <Typography
          variant="p"
          noMargin
          className={styles.noteDescription}
          htmlContent={t.TRUSTED_AUTH_PAGE_DESCRIPTION}
        ></Typography>
      </Vertical>
      <Horizontal>
        <Button
          type="SECONDARY"
          onClick={handleCopyCode}
          className={styles.button}
          text={t.COPY_CODE}
        />
        <Button
          type="SECONDARY"
          onClick={handleOpenStackBlitz}
          className={styles.button}
          text={t.OPEN_SANDBOX}
        />
      </Horizontal>
      <SyntaxHighlighter
        className={styles.font}
        language="javascript"
        style={oneDark}
      >
        {codeMap.SageEmbed}
      </SyntaxHighlighter>
      <Vertical hAlignContent="start">
        <Button
          onClick={closeVercelModal}
          className={styles.button}
          text={t.NEXT_BUTTON}
        />
      </Vertical>
    </Vertical>
  );
};
