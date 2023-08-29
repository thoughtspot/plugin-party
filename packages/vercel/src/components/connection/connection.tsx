import React, { useEffect, useState } from 'react';
import { Button } from 'widgets/lib/button';
import { AppEmbed } from '@thoughtspot/visual-embed-sdk/lib/src/react';
import styles from './connection.module.scss';
import { DocsPage } from '../docs-page/docs-page';

const getEnvVariables = async () => {
  const searchParams = new URLSearchParams(window.location.search);
  const accessCode = searchParams.get('code') || '';
  // const teamId = searchParams.get('teamId') || '';
  const param = new URLSearchParams();
  param.append('code', accessCode);
  // param.append('teamId', teamId);
  param.append('client_id', 'oac_tG9zZHVfkxmC7cNNEks7HYP7');
  param.append('client_secret', 'vzNID4h5wf8womByW3CCwHl9');
  param.append('redirect_uri', 'https://localhost:3000');
  const response = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: param,
  });
  const res = await response.json();
  const accessToken = res.access_token;
  const projRes = await fetch('https://api.vercel.com/v9/projects', {
    headers: {
      Authorization: `Bearer ${res.access_token}`,
    },
    method: 'get',
  });
  const projectData = await projRes.json();
  const projectId = projectData.projects[0].id;
  const EnvRes = await fetch(
    `https://api.vercel.com/v8/projects/${projectId}/env?decrypt=true&source=vercel-cli:pull`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'get',
    }
  );
  const envData = await EnvRes.json();
  return envData;
};

export const CreateConnection = ({ clusterUrl }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionId, setConnectionId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isDocsPageVisible, setIsDocsPageVisible] = useState(false);
  const formatClusterUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };
  const hostUrl = formatClusterUrl(clusterUrl.url);

  useEffect(() => {
    const param = new URLSearchParams();
    param.append('name', `vercel-db-conn_${Date.now()}`);
    param.append('type', 'RDBMS_POSTGRES');
    param.append('createEmpty', 'true');
    param.append('state', '-1');
    param.append(
      'metadata',
      JSON.stringify({
        configuration: {
          host: 'ep-still-recipe-227773.us-east-2.aws.neon.tech',
          password: 'ncQjp3u5PSlD',
          database: 'neondb',
          port: '5432',
          user: 'girish.singh',
        },
      })
    );

    const createConnection = async () => {
      try {
        const envVariables = await getEnvVariables();
        console.log(envVariables);
        const response = await fetch(
          `${hostUrl}/callosum/v1/tspublic/v1/connection/create`,
          {
            headers: {
              accept: 'application/json',
              'content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            method: 'POST',
            body: param,
          }
        );

        if (response.ok) {
          const rs = await response.json();
          setConnectionId(rs.header.id);
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
    console.log('encodedUrl', encodedUrl, window.location.href);
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
          console.log('hello', response);
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
          console.log('hello', rs?.Data);
          setSecretKey(rs?.Data?.token);
          setIsLoading(false);
          console.log('secret key mil gayi', secretKey);
        }
      } catch (error) {
        console.error('Network Error:', error);
      }
    };

    createConnection();
    // whitelistCSP();
    generateSecretKey();
  }, [clusterUrl, hostUrl]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // add full app embed here
  return (
    <div className={styles.docsContainer}>
      {isDocsPageVisible ? (
        <DocsPage></DocsPage>
      ) : (
        <div className={styles.container}>
          <Button
            className={styles.continueButton}
            text="Skip to Next Page"
            onClick={() => setIsDocsPageVisible(true)}
          ></Button>
          <AppEmbed
            frameParams={{
              height: '100vh',
              width: '100vw',
            }}
            path={`/data/embrace/${connectionId}/edit`}
          ></AppEmbed>
        </div>
      )}
    </div>
  );
};
