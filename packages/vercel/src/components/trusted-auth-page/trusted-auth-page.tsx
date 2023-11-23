import React from 'preact';
import { message } from 'antd';
import { Button } from 'widgets/lib/button';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslations } from 'i18n';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import styles from './trusted-auth-page.module.scss';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { EmbedTemplates } from '../docs-page/embed-code-templates';
import { getUserName } from '../../service/ts-api';
import { saveDeployedUrlEnv, saveENV } from '../../service/vercel-api';
import { generateStackblitzURL } from '../docs-page/docs-utils';
import { useAppContext } from '../../app.context';
import { Routes } from '../connection/connection-utils';

export const TrustedAuthPage = ({ hostUrl, worksheetId, deploymentUrl }) => {
  const { t } = useTranslations();
  const [userName, setUserName] = useState();
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnvAdded, setIsEnvAdded] = useState(true);
  const codeMap = {
    SageEmbed: EmbedTemplates.TrustedAuthSageEmbed(
      tsHostURL,
      worksheetId,
      deploymentUrl,
      userName
    ),
  };
  const { setStackBlitzUrl } = useAppContext();

  useEffect(() => {
    getUserName(tsHostURL)
      .then((res) => {
        setUserName(res.name);
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
    setStackBlitzUrl(stackblitzURL);
    window.open(stackblitzURL, '_blank');
  };
  useEffect(() => {
    const url = window.location.search;
    const searchParams = url.split('?');
    const addedSearchParam = new URLSearchParams(searchParams[1]);
    const accessToken = addedSearchParam.get('token') || '';
    const teamId = addedSearchParam.get('teamId') || '';
    const match = deploymentUrl.match(/https:\/\/(.*?)-/);
    const projectIds = match[1];
    saveENV(tsHostURL, { accessToken, teamId, projectIds, tsHostURL })
      .then(() => {
        setIsEnvAdded(false);
      })
      .catch((error) => {
        console.log('err', error);
        setIsEnvAdded(false);
      });
  }, []);

  const closeVercelModal = async () => {
    await saveDeployedUrlEnv();
    route(Routes.SUMMARY_PAGE);
  };

  if (isLoading || isEnvAdded) {
    return <div>Setting up Trusted Authentication...</div>;
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.heading}>{t.TRUSTED_AUTH_PAGE_HEADING}</div>
        <div className={styles.divider}></div>
        <div
          style={{ fontSize: '14px', lineHeight: '1.4' }}
          dangerouslySetInnerHTML={{ __html: t.TRUSTED_AUTH_PAGE_DESCRIPTION }}
        />
      </div>
      <div style={{ padding: '16px' }}>
        <div>
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
          <SyntaxHighlighter language="javascript" style={atomOneDark}>
            {codeMap.SageEmbed}
          </SyntaxHighlighter>
          <Button
            onClick={closeVercelModal}
            className={styles.button}
            text={t.NEXT_BUTTON}
          />
        </div>
      </div>
    </div>
  );
};
