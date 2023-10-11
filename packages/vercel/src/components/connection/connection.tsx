import React, { useEffect, useRef, useState } from 'react';
import {
  AppEmbed,
  SearchEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/lib/src/react';
import styles from './connection.module.scss';
import { NextPage } from '../next-page/next-page';
import { DocsPage } from '../docs-page/docs-page';
import {
  getEnvVariables as fetchEnvVariables,
  saveENV,
  vercelPromise,
  whiteListCSP,
} from '../utils';
import findConnectedComponents from './connection-utils';
import { SelectProject } from '../select-project/select-project';
import { SelectTables } from '../select-tables/select-tables';

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

export const CreateConnection = ({ clusterUrl }: any) => {
  const embedRef = useEmbedRef();
  const [embedPath, setEmbedPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionId, setConnectionId] = useState('');
  const [newPath, setNewPath] = useState('');
  const [page, setPage] = useState('select-page');
  const livebaordId = useRef('');
  const authURLRef = useRef('');
  const dataSources = useRef([] as any);
  const projectRef = useRef([] as any);
  const vercelConfigRef = useRef({} as any);
  const formatClusterUrl = (url: string) => {
    let formattedURL = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedURL = `https://${url}`;
    }
    return new URL(formattedURL).origin;
  };
  const hostUrl = formatClusterUrl(clusterUrl.url);
  const [connectedTablesName, setConnectedTablesName] = useState();

  const createConnection = async (connectionConfig?: any) => {
    try {
      // const { connectionConfig } = vercelConfigRef.current;
      const param2 = {
        name: `vercel-db-conn_${Date.now()}`,
        data_warehouse_type: 'POSTGRES',
        data_warehouse_config: {
          configuration: connectionConfig,
        },
        validate: 'false',
      };
      const response = await fetch(
        `${hostUrl}/api/rest/2.0/connection/create`,
        {
          headers: {
            accept: 'application/json',
            'content-Type': 'application/json',
          },
          credentials: 'include',
          method: 'POST',
          body: JSON.stringify(param2),
        }
      );

      if (response.ok) {
        const rs = await response.json();
        setConnectionId(rs.id);
        setEmbedPath(`/data/embrace/${rs.id}/edit`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setIsLoading(false);
    }
  };

  const Initialize = async () => {
    vercelConfigRef.current = await fetchEnvVariables();
    await createConnection();
    // await whiteListCSP(hostUrl, vercelConfigRef.current.hostUrl);
    // await saveENV(hostUrl, vercelConfigRef.current);
    // await generateSecretKey();
  };

  // useEffect(() => {
  //   if (clusterUrl) Initialize();
  // }, [clusterUrl]);

  const handleAllEmbedEvent = (event) => {
    if (event.type === 'updateConnection') {
      const sourceIds =
        event.data.data.updateConnection.dataSource.logicalTableList.map(
          (table) => table.header.id
        );
      const sourceNames =
        event.data.data.updateConnection.dataSource.logicalTableList.map(
          (table) => table.header.name
        );
      const sourceMap: { [id: string]: string } = {};

      for (let i = 0; i < sourceIds.length; i++) {
        sourceMap[sourceIds[i]] = sourceNames[i];
      }

      const tableRelationships =
        event.data.data.updateConnection.dataSource.logicalTableList.map(
          (table) => table.relationships
        );
      const connectedTables = findConnectedComponents(
        sourceIds,
        tableRelationships
      );
      const connectedTablesNames = connectedTables.map((connectedTable) => {
        return connectedTable
          .map((connectedTableIds) => sourceMap[connectedTableIds])
          .join(' - ');
      });
      setConnectedTablesName(connectedTablesNames);
      setPage('options');
    }
  };

  const updatePath = (navPath: string) => {
    if (navPath === 'answer') {
      setPage('search-embed');
    } else if (navPath === 'documents') {
      setPage('docs');
    } else {
      setNewPath(navPath);
      setPage('app-embed');
    }
  };

  const getDomains = async (projectIds, teamId, accessToken) => {
    const domainConfig1 = await vercelPromise(
      `https://api.vercel.com/v8/projects/${projectIds[0]}/domains?teamId=${teamId}`,
      accessToken
    );
    const domainConfig2 = await vercelPromise(
      `https://api.vercel.com/v8/projects/${projectIds[1]}/domains?teamId=${teamId}`,
      accessToken
    );
    const tsHostURL = domainConfig1.domains[0].name;

    authURLRef.current = domainConfig2.domains[0].name;
    whiteListCSP(hostUrl, tsHostURL);
    saveENV(hostUrl, {
      accessToken,
      teamId,
      projectIds,
      tsHostURL,
    });
  };

  const updateProject = async (
    project: string,
    hasPostgres: string,
    isConnectionPostgres: boolean,
    projectEnvs: any
  ) => {
    if (hasPostgres === 'Yes' && isConnectionPostgres) {
      await createConnection(projectEnvs);
    } else {
      setEmbedPath('/data/embrace/connection');
    }
    setPage('app-embed');
  };

  if (isLoading) {
    return <div>Connecting to Postgres...</div>;
  }

  // add full app embed here
  return (
    <div className={styles.docsContainer}>
      {page === 'select-page' && (
        <SelectProject updateProject={updateProject} />
      )}
      {page === 'options' && (
        <SelectTables connectedTablesName={connectedTablesName}></SelectTables>
      )}
      <div className={styles.container}>
        {page === 'app-embed' && (
          <AppEmbed
            frameParams={{
              height: '100vh',
              width: '100vw',
            }}
            ref={embedRef}
            path={newPath || embedPath}
            onALL={handleAllEmbedEvent}
            customizations={customization}
          ></AppEmbed>
        )}
        {page === 'search-embed' && (
          <SearchEmbed
            frameParams={{
              height: '100vh',
              width: '100vw',
            }}
            dataSources={dataSources.current}
            onALL={handleAllEmbedEvent}
          />
        )}
      </div>
      {page === 'docs' && (
        <DocsPage
          hostUrl={hostUrl}
          dataSources={dataSources.current}
          livebaordId={livebaordId.current}
          authUrl={authURLRef.current}
        />
      )}
    </div>
  );
};
