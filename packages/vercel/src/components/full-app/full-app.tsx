import { AppEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import styles from '../connection/connection.module.scss';
import { useAppContext } from '../../app.context';
import { createConnection } from '../../service/ts-api';
import { formatClusterUrl } from './full-app.utils';
import { Routes } from '../connection/connection-utils';

export const FullEmbed = ({ hostUrl }) => {
  const embedRef = useEmbedRef();
  const [isLoading, setIsLoading] = useState(false);
  const { setLogicalTableList, setCreateConnection } = useAppContext();
  const { projectEnv, hasPostgresConnection, isConnectionPostgres } =
    useAppContext();
  const [embedPath, setEmbedPath] = useState('');

  useEffect(() => {
    if (hasPostgresConnection === 'Yes' && isConnectionPostgres) {
      createConnection(formatClusterUrl(hostUrl.url), projectEnv)
        .then((res) => {
          setEmbedPath(`/data/embrace/${res.id}/edit`);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } else {
      setEmbedPath('/data/embrace/connection');
      setIsLoading(false);
    }
  }, [hasPostgresConnection, isConnectionPostgres]);

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

  const customization = {
    style: {
      customCSS: {
        rules_UNSTABLE: {
          '.wizard-module__buttonsContainer .button-module__secondary': {
            display: 'none',
          },
        },
      },
    },
  };

  return (
    <AppEmbed
      frameParams={{
        height: '100%',
        width: '100%',
      }}
      className={styles.container}
      ref={embedRef}
      path={embedPath}
      onALL={handleAllEmbedEvent}
      customizations={customization}
    ></AppEmbed>
  );
};
