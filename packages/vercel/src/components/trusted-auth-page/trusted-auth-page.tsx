import React from 'preact';
import { message } from 'antd';
import { Button } from 'widgets/lib/button';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslations } from 'i18n';
import { useEffect, useState } from 'preact/hooks';
import styles from './trusted-auth-page.module.scss';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { EmbedTemplates } from '../docs-page/embed-code-templates';
import { getUserName } from '../../service/ts-api';

export const TrustedAuthPage = ({ hostUrl, worksheetId, deploymentUrl }) => {
  const { t } = useTranslations();
  const [userName, setUserName] = useState();
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [isLoading, setIsLoading] = useState(true);
  const codeMap = {
    SageEmbed: EmbedTemplates.TrustedAuthSageEmbed(
      tsHostURL,
      worksheetId,
      deploymentUrl,
      userName
    ),
  };

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

  const openSandbox = () => {
    const sandboxUrl = 'https://codesandbox.io/s/eager-haze-sjp5qx';
    window.open(sandboxUrl, '_blank');
  };

  const closeVercelModal = () => {
    window.location.href =
      new URLSearchParams(window.location.search.split('?')[1]).get(
        'closeVercel'
      ) || '';
  };

  if (isLoading) {
    return <div>Setting up Trusted Authentication...</div>;
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.heading}>{t.TRUSTED_AUTH_PAGE_HEADING}</div>
        <div className={styles.divider}></div>
        <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
          {t.TRUSTED_AUTH_PAGE_DESCRIPTION}
        </div>
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
            onClick={openSandbox}
            className={styles.button}
            text={t.OPEN_SANDBOX}
          />
          <SyntaxHighlighter language="javascript" style={atomOneDark}>
            {codeMap.SageEmbed}
          </SyntaxHighlighter>
          <Button
            onClick={closeVercelModal}
            className={styles.button}
            text={t.FINISH_SETUP}
          />
        </div>
      </div>
    </div>
  );
};
