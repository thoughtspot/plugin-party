import React from 'react';
import { message } from 'antd';
import { Button } from 'widgets/lib/button';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslations } from 'i18n';
import { EmbedTemplates } from './embed-code-templates';
import styles from './docs-page.module.scss';

export const DocsPage = (params: any) => {
  const { t } = useTranslations();
  const codeMap = {
    SageEmbed: EmbedTemplates.SageEmbed(params),
  };

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
    params.setPage('nextPage');
  };

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
