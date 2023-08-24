import React from 'preact';
import { VercelTSInit } from 'vercel-ts-init/src/index';
import { useState } from 'preact/hooks';
import { CreateConnection } from './components/connection/connection';

export const App = () => {
  const [clusterUrl, setClusterUrl] = useState<any>({
    url: '',
    isCandidate: true,
  });
  return (
    <VercelTSInit setClusterUrl={setClusterUrl} clusterUrl={clusterUrl}>
      <CreateConnection clusterUrl={clusterUrl}></CreateConnection>
    </VercelTSInit>
  );
};
