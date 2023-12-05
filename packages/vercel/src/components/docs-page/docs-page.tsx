import React from 'preact';
import { route } from 'preact-router';
import { message } from 'antd';
import { Button } from 'widgets/lib/button';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslations } from 'i18n';
import { useState, useEffect } from 'preact/hooks';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import { useLoader } from 'widgets/lib/loader';
import { EmbedTemplates } from './embed-code-templates';
import styles from './docs-page.module.scss';
import { Routes } from '../connection/connection-utils';
import { useAppContext } from '../../app.context';
import { generateWorksheetTML } from '../../service/ts-api';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { generateStackblitzURL } from './docs-utils';

export const DocsPage = ({ hostUrl, vercelToken }) => {
  const { t } = useTranslations();
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const [isLoading, setIsLoading] = useState(true);
  const loader = useLoader();
  const {
    dataSourcesId,
    relationshipId,
    selectedProject,
    setWorksheetId,
    hasAdminPrivileges,
    selectedDataSourceName,
    worksheetId,
  } = useAppContext();
  const [newWorksheetId, setNewWorksheetId] = useState();
  const codeMap = {
    SageEmbed: EmbedTemplates.SageEmbed(tsHostURL, newWorksheetId),
  };

  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    if (worksheetId === '') {
      generateWorksheetTML(
        tsHostURL,
        vercelToken,
        dataSourcesId,
        relationshipId,
        selectedProject,
        selectedDataSourceName
      )
        .then((res) => {
          setWorksheetId(res);
          setNewWorksheetId(res);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setErrorMessage({ visible: true, message: t.CREATE_WORKSHEET_ERROR });
          setIsLoading(false);
        });
    } else {
      loader.hide();
      setIsLoading(false);
      setNewWorksheetId(worksheetId);
    }
  }, [dataSourcesId, relationshipId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeMap.SageEmbed);
    message.success('Code copied to clipboard');
  };

  const handleOpenStackBlitz = () => {
    const stackblitzURL = generateStackblitzURL(codeMap.SageEmbed);
    window.open(stackblitzURL, '_blank');
  };

  const closeVercelModal = () => {
    window.location.href =
      new URLSearchParams(window.location.search).get('next') || '';
  };

  const goToTrustedAuth = async () => {
    if (!hasAdminPrivileges) {
      setErrorMessage({ visible: true, message: t.ADMIN_PRIVILEGE_ISSUE });
    } else {
      route(Routes.NEXT_PAGE);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>{t.CREATE_WORKSHEET_LOADING}</h1>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <Vertical className={styles.container}>
      <ErrorBanner
        errorMessage={errorMessage.message}
        bannerType={BannerType.MESSAGE}
        errorCardButton={{
          name: '',
        }}
        showCloseIcon={false}
        showBanner={errorMessage.visible && !!errorMessage.message}
      />
      <Typography variant="h2" className={styles.heading}>
        {t.TEST_EMBED_HEADING}
      </Typography>
      <Typography
        variant="p"
        className={styles.text}
        htmlContent={t.TEST_EMBED_DESCRIPTION}
      ></Typography>
      <Horizontal className={styles.buttonContainer}>
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
      <SyntaxHighlighter language="javascript" style={atomOneDark}>
        {codeMap.SageEmbed}
      </SyntaxHighlighter>
      <Vertical className={styles.noteContainer}>
        <Typography className={styles.noteHeading} variant="h6" noMargin>
          NOTE
        </Typography>
        <Typography variant="p" noMargin className={styles.noteDescription}>
          {t.CODE_SAMPLE_DESCRIPTION}
        </Typography>
      </Vertical>
      <Horizontal className={styles.buttonContainer}>
        <Button
          type="SECONDARY"
          onClick={closeVercelModal}
          className={styles.button}
          text={t.EXIT_SETUP}
        />
        <Button
          onClick={goToTrustedAuth}
          className={styles.button}
          text={t.NEXT_BUTTON}
        />
      </Horizontal>
    </Vertical>
  );
};
