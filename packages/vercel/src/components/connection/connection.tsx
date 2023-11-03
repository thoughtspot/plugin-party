import React, { useState } from 'react';
import Router, { route, useRouter } from 'preact-router';
import { createMemoryHistory, createHashHistory } from 'history';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { Stepper } from 'widgets/lib/stepper';
import styles from './connection.module.scss';
import { NextPage } from '../next-page/next-page';
import { DocsPage } from '../docs-page/docs-page';
import { saveENV, vercelPromise, whiteListCSP } from '../../service/vercel-api';
import findConnectedComponents, { Routes, steps } from './connection-utils';
import { SelectProject } from '../select-project/select-project';
import { SelectTables } from '../select-tables/select-tables';
import { FullEmbed } from '../full-app/full-app';

export const CreateConnection = ({ clusterUrl }: any) => {
  const history: any = createMemoryHistory();
  const [router] = useRouter();
  const currentRouteIndex = Object.values(Routes).indexOf(router.path);
  const [embedPath, setEmbedPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionId, setConnectionId] = useState('');
  const [vercelAccessToken, setVercelAccessToken] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [worksheetId, setWorksheetId] = useState('');
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

  const getDomains = async (projectIds, teamId, accessToken) => {
    const domainConfig = await vercelPromise(
      `https://api.vercel.com/v8/projects/${projectIds}/domains?teamId=${teamId}`,
      accessToken
    );
    const tsHostURL = domainConfig.domains[0].name;
    whiteListCSP(hostUrl, tsHostURL);
    saveENV(hostUrl, {
      accessToken,
      teamId,
      projectIds,
      tsHostURL,
    });
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
        const searchParams = new URLSearchParams(window.location.search);
        const teamId = searchParams.get('teamId') || '';
        await getDomains(selectedProjectName, teamId, vercelAccessToken);
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
      route(Routes.OPTIONS);
    }
  };

  const updateProject = async (
    vercelToken: string,
    project: string,
    hasPostgres: string,
    isConnectionPostgres: boolean,
    projectEnvs: any
  ) => {
    setVercelAccessToken(vercelToken);
    setSelectedProjectName(project);
    if (hasPostgres === 'Yes' && isConnectionPostgres) {
      await createConnection(projectEnvs);
    } else {
      setEmbedPath('/data/embrace/connection');
    }
    route(Routes.APP_EMBED);
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
          return true;
        }
        return false;
      })
      .map((dataSourceRelationship) => dataSourceRelationship[0]);

    await generateWorksheetTML(dataSourcesId, relationshipIds);
    route(Routes.DOCUMENTS);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <div className="loading-text">Connecting to Postgres...</div>
      </div>
    );
  }

  return (
    <Horizontal spacing="e" className={styles.docsContainer}>
      <Router history={history}>
        <SelectProject
          updateProject={updateProject}
          path={Routes.SELECT_PAGE}
        />
        <FullEmbed
          embedPath={embedPath}
          handleAllEmbedEvent={handleAllEmbedEvent}
          path={Routes.APP_EMBED}
        />
        <SelectTables
          connectedTablesName={connectedTablesName}
          updateDataSource={updateDataSource}
          path={Routes.OPTIONS}
        />
        <DocsPage
          hostUrl={hostUrl}
          worksheetId={worksheetId}
          path={Routes.DOCUMENTS}
        />
        <NextPage path={Routes.NEXT_PAGE} />
      </Router>
      <Vertical hAlignContent="stretch" className={styles.stepper}>
        <Stepper
          currentStep={currentRouteIndex > 0 ? currentRouteIndex : 1}
          steps={steps}
        ></Stepper>
      </Vertical>
    </Horizontal>
  );
};
