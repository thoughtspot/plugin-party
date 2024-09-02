import React from 'preact';
import { route } from 'preact-router';
import { message } from 'antd';
import { Button } from 'widgets/lib/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslations } from 'i18n';
import { useState, useEffect } from 'preact/hooks';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import { useLoader } from 'widgets/lib/loader';
import { CircularLoader } from 'widgets/lib/circular-loader';
import { EmbedTemplates } from './embed-code-templates';
import styles from './auth-type-none-page.module.scss';
import { Routes } from '../connection/connection-utils';
import { useAppContext } from '../../app.context';
import {
  generateSecretKey,
  generateWorksheetTML,
  getUserName,
} from '../../service/ts-api';
import { formatClusterUrl } from '../full-app/full-app.utils';
import { generateStackblitzURL } from './docs-utils';
import { whiteListCSP, fetchSecretKey } from '../../service/vercel-api';

export const DocsPage = ({ hostUrl, vercelToken }) => {
  const { t } = useTranslations();
  const tsHostURL = formatClusterUrl(hostUrl.url);
  const loader = useLoader();
  loader.hide();
  const {
    dataSourcesId,
    relationshipId,
    selectedProject,
    setWorksheetId,
    hasAdminPrivileges,
    selectedDataSourceName,
    worksheetId,
    setSecretKey,
    setHasAdminPrivilege,
    isTrustedAuthEnabled,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const localStorageWorksheet = localStorage.getItem('worksheetId');
  const [newWorksheetId, setNewWorksheetId] = useState(worksheetId);
  const codeMap = {
    SageEmbed: EmbedTemplates.SageEmbed(tsHostURL, newWorksheetId),
  };

  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const [cspErrorMessage, setCspErrorMessage] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (worksheetId === '') {
          const worksheetRes = await generateWorksheetTML(
            tsHostURL,
            dataSourcesId,
            relationshipId,
            selectedDataSourceName
          );
          setWorksheetId(worksheetRes);
          setNewWorksheetId(worksheetRes);
          setIsLoading(false);
        } else {
          loader.hide();
        }
      } catch (error) {
        console.error(error);
        setErrorMessage({ visible: true, message: t.CREATE_WORKSHEET_ERROR });
        setIsLoading(false);
      }
    };

    const whiteListCSPAndGenerateSecretKey = async () => {
      try {
        const { secretKey, userVercelDomain } = await generateSecretKey(
          tsHostURL,
          vercelToken,
          selectedProject,
          worksheetId
        );
        setSecretKey(secretKey);
        await whiteListCSP(tsHostURL, userVercelDomain);
        if (worksheetId !== '') setIsLoading(false);
      } catch (error) {
        if (worksheetId !== '') setIsLoading(false);
        console.error(error);
        setCspErrorMessage({ visible: true, message: t.WHITELIST_CSP_ERROR });
      }
    };
    if (!localStorageWorksheet) {
      fetchData();
      whiteListCSPAndGenerateSecretKey();
      if (!hasAdminPrivileges) {
        setErrorMessage({
          visible: true,
          message: t.ADMIN_PRIVILEGE_ISSUE,
        });
      }
    } else {
      const TSClusterId = localStorage.getItem('clusterUrl') || '';
      setNewWorksheetId(localStorageWorksheet);
      const fetchPrivilege = async () => {
        try {
          const tsUserInfo = await getUserName(TSClusterId);
          const userPrivilege = tsUserInfo.privileges;
          setHasAdminPrivilege(
            userPrivilege.includes('ADMINISTRATION') ||
              userPrivilege.includes('CONTROL_TRUSTED_AUTH')
          );
          const res = await fetchSecretKey(TSClusterId);
          setSecretKey(res.Data.token);
          setIsLoading(false);
        } catch (error) {
          console.log(error);
          setIsLoading(false);
          setErrorMessage({ visible: true, message: t.ADMIN_PRIVILEGE_ISSUE });
        }
      };
      fetchPrivilege();
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeMap.SageEmbed);
    message.success('Code copied to clipboard');
  };

  const handleOpenStackBlitz = () => {
    const stackblitzURL = generateStackblitzURL(codeMap.SageEmbed);
    window.open(stackblitzURL, '_blank');
  };

  const closeVercelModal = () => {
    localStorage.setItem('isDocsPage', 'true');
    localStorage.setItem('worksheetId', newWorksheetId);
    localStorage.setItem('clusterUrl', tsHostURL);
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
      <CircularLoader
        loadingText={
          worksheetId === ''
            ? t.CREATE_WORKSHEET_LOADING
            : t.WHITELISTING_DOMAIN_LOADING
        }
      ></CircularLoader>
    );
  }

  return (
    <Vertical className={styles.container}>
      <ErrorBanner
        errorMessage={cspErrorMessage.message}
        bannerType={BannerType.MESSAGE}
        errorCardButton={{
          name: '',
        }}
        showCloseIcon={false}
        showBanner={cspErrorMessage.visible && !!cspErrorMessage.message}
      ></ErrorBanner>
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
      <SyntaxHighlighter
        className={styles.font}
        language="javascript"
        style={oneDark}
      >
        {codeMap.SageEmbed}
      </SyntaxHighlighter>
      <Vertical className={styles.noteContainer}>
        <Typography className={styles.noteHeading} variant="h6" noMargin>
          NOTE
        </Typography>
        <Typography
          variant="p"
          noMargin
          className={styles.noteDescription}
          htmlContent={t.CODE_SAMPLE_DESCRIPTION}
        ></Typography>
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
          isDisabled={!hasAdminPrivileges || !isTrustedAuthEnabled}
          disabledReason={t.NEXT_BUTTON_DISABLED_MESSAGE}
        />
      </Horizontal>
    </Vertical>
  );
};
