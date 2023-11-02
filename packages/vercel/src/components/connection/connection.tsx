import React, { useRef, useState } from 'react';
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
  const [worksheetId, setWorksheetId] = useState('');
  const [page, setPage] = useState('select-page');
  console.log('page', page);
  const livebaordId = useRef('');
  const authURLRef = useRef('');
  const dataSources = useRef([] as any);
  const projectRef = useRef([] as any);
  const vercelConfigRef = useRef({} as any);
  const [tableNameToIdMap, setTableNameToIdMap] =
    useState<Record<string, string>>();
  const formatClusterUrl = (url: string) => {
    let formattedURL = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedURL = `https://${url}`;
    }
    return new URL(formattedURL).origin;
  };
  const hostUrl = formatClusterUrl(clusterUrl.url);
  const [connectedTablesName, setConnectedTablesName] = useState();
  const [relationship, setRelationship] = useState<any[]>();

  const createConnection = async (connectionConfig?: any) => {
    try {
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

  const ImportWorksheetTML = async (
    request: any,
    generationType = 'DEFAULT'
  ) => {
    try {
      const formData = new URLSearchParams();
      formData.append('request', JSON.stringify(request));
      formData.append('generationType', generationType);
      const response = await fetch(
        `${hostUrl}/callosum/v1/autogen/worksheet/save`,
        {
          headers: {
            'content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/plain',
          },
          credentials: 'include',
          method: 'POST',
          body: formData,
        }
      );
      if (response.ok) {
        const rs = await response.json();
        setWorksheetId(rs.object[0].response.header.id_guid);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const generateWorksheetTML = async (tableIds, relationships) => {
    try {
      const formData = new URLSearchParams();
      formData.append('tableIds', JSON.stringify(tableIds));
      formData.append('relationships', JSON.stringify(relationships));

      const response = await fetch(`${hostUrl}/callosum/v1/autogen/worksheet`, {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const rs = await response.json();
        const params = { object: rs.object };
        await ImportWorksheetTML(params);
      }
    } catch (error) {
      console.log('err', error);
    }
  };

  const handleAllEmbedEvent = (event) => {
    if (
      event.type === 'updateConnection' ||
      event.type === 'createConnection'
    ) {
      const res =
        event.type === 'updateConnection'
          ? event.data.data.updateConnection.dataSource.logicalTableList
          : event.data.data.createConnection.dataSource.logicalTableList;
      const sourceIds = res.map((table) => table.header.id);
      const sourceNames = res.map((table) => table.header.name);
      const tableIdToNameMap: { [id: string]: string } = {};
      const tableNameToIdsMap: { [id: string]: string } = {};

      for (let i = 0; i < sourceIds.length; i++) {
        tableIdToNameMap[sourceIds[i]] = sourceNames[i];
      }

      for (let i = 0; i < sourceIds.length; i++) {
        tableNameToIdsMap[sourceNames[i]] = sourceIds[i];
      }

      setTableNameToIdMap(tableNameToIdsMap);

      const tableRelationships = res.map((table) => table.relationships);
      setRelationship(tableRelationships);
      const connectedTables = findConnectedComponents(
        sourceIds,
        tableRelationships
      );
      const connectedTablesNames = connectedTables.map((connectedTable) => {
        return connectedTable
          .map((connectedTableIds) => tableIdToNameMap[connectedTableIds])
          .join(' - ');
      });
      setConnectedTablesName(connectedTablesNames);
      setPage('options');
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

  const updateDataSource = async (selectDataSources: string) => {
    const dataSourcesName = selectDataSources.split(' - ');
    const dataSourcesId = dataSourcesName.map(
      (dataSource) => tableNameToIdMap?.[dataSource]
    );

    const relationshipIds = relationship
      ?.filter((dataSourceRelationship) => {
        if (
          dataSourceRelationship.length > 0 &&
          dataSourcesId.includes(dataSourceRelationship[0]?.sourceTable) &&
          dataSourcesId.includes(dataSourceRelationship[0]?.destinationTable)
        ) {
          console.log('hello');
          return true;
        }
        return false;
      })
      .map((dataSourceRelationship) => dataSourceRelationship[0]);

    await generateWorksheetTML(dataSourcesId, relationshipIds);
    setPage('documents');
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
      {page === 'documents' && (
        <DocsPage
          setPage={setPage}
          hostUrl={hostUrl}
          worksheetId={worksheetId}
        ></DocsPage>
      )}
      {page === 'nextPage' && <NextPage></NextPage>}
      {page === 'options' && (
        <SelectTables
          connectedTablesName={connectedTablesName}
          updateDataSource={updateDataSource}
        ></SelectTables>
      )}
      <div className={styles.container}>
        {page === 'app-embed' && (
          <AppEmbed
            frameParams={{
              height: '100vh',
              width: '100vw',
            }}
            ref={embedRef}
            path={embedPath}
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
