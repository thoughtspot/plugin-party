import { AppEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useTranslations } from 'i18n';
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
    setIsLoading(false);
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
    setSelectedDataSource((prevSelectedDataSource) =>
      prevSelectedDataSource === existingDataSources[index].id
        ? ''
        : existingDataSources[index].id
    );
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
    return <CircularLoader loadingText={t.FULL_APP_LOADER}></CircularLoader>;
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
              data={existingDataSources}
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
