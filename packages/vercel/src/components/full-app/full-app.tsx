import { AppEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useTranslations } from 'i18n';
import { useLoader } from 'widgets/lib/loader';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import React from 'react';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Button } from 'widgets/lib/button';
import { Typography } from 'widgets/lib/typography';
import { TableListView } from 'widgets/lib/table-list-view';
import { CircularLoader } from 'widgets/lib/circular-loader';
import styles from './full-app.module.scss';
import { useAppContext } from '../../app.context';
import { createConnection, getMetadataList } from '../../service/ts-api';
import { formatClusterUrl } from './full-app.utils';
import { Routes } from '../connection/connection-utils';

export const FullEmbed = ({ hostUrl }) => {
  const { t } = useTranslations();
  const loader = useLoader();
  loader.hide();
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
  const [existingDataSources, setExistingDataSources] = useState<any>([]);
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      if (res.headers.length) {
        setSelectedDataSource(res.headers[0].id);
      }
      setIsLoading(false);
    };
    if (isExistingDataSouce) {
      fetchMetadataSources();
    } else if (hasPostgresConnection && isConnectionPostgres) {
      createConnection(formatClusterUrl(tsHostURL), projectEnv)
        .then((res) => {
          setIsLoading(false);
          setEmbedPath(`/data/embrace/${res.id}/edit`);
        })
        .catch((error) => {
          setIsLoading(false);
          console.log(error);
          setErrorMessage({
            visible: true,
            message: t.CREATE_CONNECTION_ERROR,
          });
        });
    } else {
      setEmbedPath('/data/embrace/connection');
      setIsLoading(false);
    }
  }, []);

  const handleCreateConnectionEvent = (event) => {
    const res = event.data.data.createConnection.logicalTableList;
    setLogicalTableList(res);
    setCreateConnection(true);
    route(Routes.OPTIONS);
  };

  const handleUpdateConnectionEvent = (event) => {
    const res = event.data.data.updateConnection.dataSource.logicalTableList;
    setLogicalTableList(res);
    setCreateConnection(false);
    route(Routes.OPTIONS);
  };

  const handleSelectDataSources = (dataSourceName: string, index: number) => {
    setSelectedDataSource(existingDataSources[index].id);
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

  if (isLoading) {
    return (
      <CircularLoader
        loadingText={isExistingDataSouce ? t.FULL_APP_LOADER : t.LOADING}
      ></CircularLoader>
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
      {isExistingDataSouce && !isLoading ? (
        <>
          <Typography className={styles.heading} variant="h2">
            {t.SELECT_EXISTING_DATA_SOURCES}
          </Typography>
          <Vertical className={styles.modal} hAlignContent="start">
            <TableListView
              textTitle="DataSource Name"
              textWithIconTitle="Type"
              onRowClick={handleSelectDataSources}
              data={existingDataSources.sort((a, b) =>
                a.name.localeCompare(b.name)
              )}
              iconText={existingDataSources.map((dataSource: any) => {
                return dataSource.type === 'WORKSHEET' ? 'Worksheet' : 'Table';
              })}
            ></TableListView>
          </Vertical>
          <Vertical className={styles.buttonContainer} hAlignContent="center">
            <Button
              onClick={updateSelectedDataSources}
              text={t.CONTINUE}
              isDisabled={selectedDataSource === ''}
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
          onCreateConnection={handleCreateConnectionEvent}
          onUpdateConnection={handleUpdateConnectionEvent}
          customizations={customization}
        ></AppEmbed>
      )}
    </Vertical>
  );
};
