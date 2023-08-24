import React, { useEffect, useState } from 'react';
import {
  LiveboardEmbed,
  useEmbedRef,
  AppEmbed,
} from '@thoughtspot/visual-embed-sdk/lib/src/react';

interface Metadata {
  configuration: {
    host: string;
    password: string;
    database: string;
    port: string;
    user: string;
  };
}

interface ParamObject {
  name: string;
  type: string;
  createEmpty: boolean;
  state: number;
  metadata: Metadata;
}
enum Page {
  Data = 'data',
}

export const CreateConnection = ({ clusterUrl }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionId, setConnectionId] = useState('');
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

    createConnection();
  }, [clusterUrl, hostUrl]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // add full app embed here
  return (
    <>
      <AppEmbed
        frameParams={{
          height: 1000,
          width: 1900,
        }}
        path={`/data/embrace/${connectionId}/edit`}
      ></AppEmbed>
    </>
  );
};
