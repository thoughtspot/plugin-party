import React, { useEffect, useRef, useState } from 'react';
import {
  AppEmbed,
  HostEvent,
  SearchEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/lib/src/react';
import styles from './connection.module.scss';
import { NextPage } from '../next-page/next-page';
import { DocsPage } from '../docs-page/docs-page';

const CLIENT_ID = 'oac_ZRDkEzGSa8knXCmJ8XNAbkkN';
const CLIENT_SECRET = 'u7y8OoZROu3h1ymreAnCA7QV';
const envMapping = {
  PGUSER: 'user',
  PGPASSWORD: 'password',
  PGHOST: 'host',
  PGDATABASE: 'database',
};


const customization = {
  style: {
    customCSS: {
      rules_UNSTABLE: {
        '.wizard-module__buttonsContainer .button-module__secondary': {
          'display': 'none',
        },
      },
    },
  },
};

const getConnectionParams = (envParams) => {
  const paramObj: any = {};
  envParams.forEach((element) => {
    if (envMapping[element.key]) {
      paramObj[envMapping[element.key]] = element.value;
    }
  });
  // paramObj.database = 'Test';
  paramObj.port = '5432';
  return paramObj;
};

const getEnvVariables = async () => {
  const searchParams = new URLSearchParams(window.location.search);
  const accessCode = searchParams.get('code') || '';
  const teamId = searchParams.get('teamId') || '';
  const param = new URLSearchParams();
  param.append('code', accessCode);
  param.append('client_id', CLIENT_ID);
  param.append('client_secret', CLIENT_SECRET);
  param.append('redirect_uri', window.location.origin);
  const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: param,
  });
  let vercelProjectApiEndpoint = 'https://api.vercel.com/v9/projects';
  if (teamId) {
    vercelProjectApiEndpoint += `?teamId=${teamId}`;
  }
  const res = await response.json();
  const accessToken = res.access_token;
  const projRes = await fetch(vercelProjectApiEndpoint, {
    headers: {
      Authorization: `Bearer ${res.access_token}`,
    },
    method: 'get',
  });
  const projectData = await projRes.json();
  const projectId = projectData.projects[0].id;
  let fetchVercelApiEndPoint = `https://api.vercel.com/v8/projects/${projectId}/env?decrypt=true&source=vercel-cli:pull`;
  if (teamId) {
    fetchVercelApiEndPoint += `&teamId=${teamId}`;
  }
  const EnvRes = await fetch(fetchVercelApiEndPoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'get',
  });
  const envData = await EnvRes.json();
  return envData;
};

export const CreateConnection = ({ clusterUrl }: any) => {
  const embedRef = useEmbedRef();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionId, setConnectionId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [newPath, setNewPath] = useState('');
  const [page, setPage] = useState('docs')
  const answerID = useRef('')
  const livebaordId = useRef('')
  const dataSources = useRef([])
  const formatClusterUrl = (url: string) => {
    let formattedURL = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedURL = `https://${url}`;
    }
    return (new URL(formattedURL).origin);
  };
  const hostUrl = formatClusterUrl(clusterUrl.url);

  useEffect(() => {
    const createConnection = async () => {
      try {
        const envVariables = await getEnvVariables();
        const connectionParams = getConnectionParams(envVariables.envs);
        const param = new URLSearchParams();
        param.append('name', `vercel-db-conn_${Date.now()}`);
        param.append('type', 'RDBMS_POSTGRES');
        param.append('createEmpty', 'true');
        param.append('state', '-1');
        param.append(
          'metadata',
          JSON.stringify({
            configuration: connectionParams,
          })
        );
        const param2 = {
          name: `vercel-db-conn_${Date.now()}`,
          data_warehouse_type: 'POSTGRES',
          data_warehouse_config: {
            configuration: connectionParams,
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
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Network Error:', error);
        setIsLoading(false);
      }
    };

    // whitelist the urls.
    // url: `nginxcsp`,
    const encodedUrl = btoa(window.location.href);
    const params = {
      configOperation: 'add',
      configOptions: [
        {
          optionKey: 'nginx_csp_frame_ancestors',
          optionValue: encodedUrl,
        },
      ],
    };
    const whitelistCSP = async () => {
      try {
        const response = await fetch(
          `${hostUrl}/managementconsole/admin-api/nginxcsp`,
          {
            headers: {
              accept: 'application/json',
              'content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify(params),
          }
        );

        if (response.ok) {
          const rs = await response.json();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Network Error:', error);
      }
    };

    const generateSecretKey = async () => {
      try {
        const response = await fetch(
          `${hostUrl}/managementconsole/admin-api/tokenauth?view_mode=all`,
          {
            headers: {
              accept: 'application/json',
              'content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            method: 'POST',
          }
        );
        if (response.ok) {
          const rs = await response.json();
          setSecretKey(rs?.Data?.token);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Network Error:', error);
      }
    };

    createConnection();
    // whitelistCSP();
    generateSecretKey();
  }, [clusterUrl, hostUrl]);

  const handleAllEmbedEvent = (event) => {
    console.log('event', event)
    if (
      event.type === 'updateConnection' ||
      event.type === 'createConnection'
    ) {
      console.log(event);
      if(event.data.data.updateConnection.dataSource.logicalTableList) {
        const sourceIds = event.data.data.updateConnection.dataSource.logicalTableList.map(table => table.header.id);
        dataSources.current = sourceIds;
        console.log(sourceIds)
      }
      setPage('options')
    }
    else if (
      event.type === 'createWorksheet'
    ) {
      console.log(event);
      dataSources.current = event.data.cloneWorksheetModel.header.guid;
      console.log(dataSources)
      setPage('options')
    }
    else if (
      event.type === 'save'
    ) {
      console.log(event);
      answerID.current = event.data.answerId;
      console.log(dataSources)
      setPage('options')
    }
    else if (
      event.type === 'pin'
    ) {
      console.log(event);
      livebaordId.current = event.data.liveboardId;
      console.log(dataSources)
      setPage('options')
    }
  };

  const updatePath = (navPath: string) => {
    if(navPath == 'answer') {
      setPage('search-embed')
    }
    if(navPath == 'documents') {
      setPage('docs')
    }
    setNewPath(newPath)
    setPage('app-embed')
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // add full app embed here
  return (
    <div className={styles.docsContainer}>
      {page === 'options' && (
        <NextPage
          updatePath={updatePath}
        ></NextPage>
      )}
      <div className={styles.container}>
        {page === 'app-embed' && (
            <AppEmbed
            frameParams={{
              height: '100vh',
              width: '100vw',
            }}
            ref={embedRef}
            path={newPath || `/data/embrace/${connectionId}/edit`}
            onALL={handleAllEmbedEvent}
            showPrimaryNavbar
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
        <DocsPage />
      )}
    </div>
  );
};
