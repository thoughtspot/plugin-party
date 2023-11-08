import React from 'preact';
import { route } from 'preact-router';
import { message } from 'antd';
import { Button } from 'widgets/lib/button';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslations } from 'i18n';
import { useState, useEffect } from 'preact/hooks';
import { EmbedTemplates } from './embed-code-templates';
import styles from './docs-page.module.scss';
import { Routes } from '../connection/connection-utils';
import { useAppContext } from '../../app.context';
import { generateWorksheetTML } from '../../service/ts-api';
import { formatClusterUrl } from '../full-app/full-app.utils';

export const DocsPage = ({ hostUrl }) => {
  const { t } = useTranslations();
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [isLoading, setIsLoading] = useState(true);
  const [worksheetId, setWorksheetId] = useState();
  const { dataSourcesId, relationshipId, vercelToken, selectedProject } =
    useAppContext();
  const codeMap = {
    SageEmbed: EmbedTemplates.SageEmbed(tsHostURL, worksheetId),
  };

  useEffect(() => {
    generateWorksheetTML(
      tsHostURL,
      vercelToken,
      dataSourcesId,
      relationshipId,
      selectedProject
    )
      .then((res) => {
        setWorksheetId(res);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, [dataSourcesId, relationshipId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeMap.SageEmbed);
    message.success('Code copied to clipboard');
  };

  const openSandbox = () => {
    const sandboxUrl = 'https://codesandbox.io/s/eager-haze-sjp5qx';
    window.open(sandboxUrl, '_blank');
  };

  const closeVercelModal = () => {
    window.location.href =
      new URLSearchParams(window.location.search).get('next') || '';
  };

  const goToTrustedAuth = () => {
    route(Routes.NEXT_PAGE);
  };

  if (isLoading) {
    return <div>Creating Worksheet...</div>;
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.heading}>{t.TEST_EMBED_HEADING}</div>
        <div className={styles.divider}></div>
        <p>{t.TEST_EMBED_DESCRIPTION}</p>
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
            onClick={openSandbox}
            className={styles.button}
            text={t.OPEN_SANDBOX}
          />
          <SyntaxHighlighter language="javascript" style={atomOneDark}>
            {codeMap.SageEmbed}
          </SyntaxHighlighter>
          <div className={styles.codeSample}>
            <p style={{ fontSize: '14px', lineHeight: '1.4' }}>
              {t.CODE_SAMPLE_DESCRIPTION}
            </p>
          </div>
          <Button
            onClick={closeVercelModal}
            className={styles.button}
            text={t.EXIT_SETUP}
          />
          <Button
            onClick={goToTrustedAuth}
            className={styles.button}
            text={t.NEXT_BUTTON}
          />
        </div>
      </div>
    </div>
  );
};
