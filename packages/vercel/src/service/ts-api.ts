import { getDomains } from './vercel-api';

export const createConnection = async (
  hostUrl: string,
  connectionConfig?: any
) => {
  const param = {
    name: `vercel-db-conn_${Date.now()}`,
    data_warehouse_type: 'POSTGRES',
    data_warehouse_config: {
      configuration: connectionConfig,
    },
    validate: 'false',
  };
  const response = await fetch(`${hostUrl}/api/rest/2.0/connection/create`, {
    headers: {
      accept: 'application/json',
      'content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(param),
  });

  const res = await response.json();
  return res;
};

const ImportWorksheetTML = async (
  hostUrl,
  request: any,
  generationType = 'DEFAULT'
) => {
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
  const rs = await response.json();
  return rs;
};

export const generateWorksheetTML = async (
  hostUrl,
  vercelAccessToken,
  tableIds,
  relationships,
  selectedProjectName
) => {
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
  const rs = await response.json();
  const params = { object: rs.object };
  const res = await ImportWorksheetTML(hostUrl, params);
  const searchParams = new URLSearchParams(window.location.search);
  const teamId = searchParams.get('teamId') || '';
  await getDomains(hostUrl, selectedProjectName, teamId, vercelAccessToken);
  return res;
};
