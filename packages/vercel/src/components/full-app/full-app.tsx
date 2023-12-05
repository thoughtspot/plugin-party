import { AppEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useTranslations } from 'i18n';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import React from 'react';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Button } from 'widgets/lib/button';
import { Typography } from 'widgets/lib/typography';
import styles from './full-app.module.scss';
import { useAppContext } from '../../app.context';
import { createConnection, getMetadataList } from '../../service/ts-api';
import { formatClusterUrl } from './full-app.utils';
import { Routes } from '../connection/connection-utils';

export const FullEmbed = ({ hostUrl }) => {
  const { t } = useTranslations();
  const embedRef = useEmbedRef();
  const {
    setLogicalTableList,
    setCreateConnection,
    projectEnv,
    hasPostgresConnection,
    isConnectionPostgres,
    isExistingDataSouce,
    setWorksheetId,
  } = useAppContext();
  const [existingDataSources, setExistingDataSources] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState('');

  const [embedPath, setEmbedPath] = useState('');
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const tsHostURL = formatClusterUrl(hostUrl.url);

  useEffect(() => {
    const fetchMetadataSources = async () => {
      const res = await getMetadataList(tsHostURL);
      setExistingDataSources(res.headers);
    };
    if (isExistingDataSouce) {
      fetchMetadataSources();
    } else if (hasPostgresConnection && isConnectionPostgres) {
      createConnection(formatClusterUrl(tsHostURL), projectEnv)
        .then((res) => {
          setEmbedPath(`/data/embrace/${res.id}/edit`);
        })
        .catch((error) => {
          console.log(error);
          setErrorMessage({
            visible: true,
            message: t.CREATE_CONNECTION_ERROR,
          });
        });
    } else {
      setEmbedPath('/data/embrace/connection');
    }
  }, []);

  const handleAllEmbedEvent = (event) => {
    if (
      event.type === 'updateConnection' ||
      event.type === 'createConnection'
    ) {
      const res =
        event.type === 'updateConnection'
          ? event.data.data.updateConnection.dataSource.logicalTableList
          : event.data.data.createConnection.logicalTableList;
      setLogicalTableList(res);
      if (event.type === 'createConnection') {
        setCreateConnection(true);
      } else {
        setCreateConnection(false);
      }
      route(Routes.OPTIONS);
    }
  };

  const handleSelectDataSources = (dataSource) => {
    setSelectedDataSource(dataSource.id);
  };

  const updateSelectedDataSources = () => {
    setWorksheetId(selectedDataSource);
    route(Routes.DOCUMENTS);
  };

  const customization = {
    style: {
      customCSS: {
        rules_UNSTABLE: {
          '.wizard-module__buttonsContainer .button-module__secondary': {
            display: 'none',
          },
          '.wizard-module__wizardHeader': {
            'background-color': '#f6f8fa',
            'flex-direction': 'row-reverse',
            'box-shadow': 'none',
          },
          '.wizard-module__wizardHeaderInfo': {
            display: 'none',
          },
          '[data-testid="divider"]': {
            display: 'none !important',
          },
        },
      },
    },
  };

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
      {isExistingDataSouce ? (
        <>
          <Typography className={styles.heading} variant="h2">
            {t.SELECT_EXISTING_DATASOURCES}
          </Typography>
          <Vertical className={styles.modal} hAlignContent="start">
            {existingDataSources.map((dataSource: any) => (
              <div className={styles.option}>
                <input
                  type="radio"
                  checked={dataSource.id === selectedDataSource}
                  onChange={() => handleSelectDataSources(dataSource)}
                />
                {dataSource.name}
              </div>
            ))}
          </Vertical>
          <Vertical className={styles.buttonContainer} hAlignContent="center">
            <Button
              onClick={updateSelectedDataSources}
              text={t.CONTINUE}
            ></Button>
          </Vertical>
        </>
      ) : (
        <AppEmbed
          frameParams={{
            height: '100%',
            width: '100%',
          }}
          className={styles.fullApp}
          ref={embedRef}
          path={embedPath}
          onALL={handleAllEmbedEvent}
          customizations={customization}
        ></AppEmbed>
      )}
    </Vertical>
  );
};
