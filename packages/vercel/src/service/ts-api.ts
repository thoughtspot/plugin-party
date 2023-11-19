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

const ImportWorksheetTML = async (hostUrl, request: any) => {
  const payload = {
    metadata_tmls: request,
    import_policy: 'ALL_OR_NONE',
    create_new: false,
  };
  const response = await fetch(`${hostUrl}/api/rest/2.0/metadata/tml/import`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const rs = await response.json();
  return rs;
};

export const getUserName = async (hostUrl) => {
  const response = await fetch(`${hostUrl}/api/rest/2.0/auth/session/user`, {
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
    method: 'GET',
  });
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

  try {
    const response = await fetch(`${hostUrl}/callosum/v1/autogen/worksheet`, {
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error generating worksheet');
    }

    const result = await response.json();
    const metadataTmls = result.object.map((test) => test.edoc);
    const resp = await ImportWorksheetTML(hostUrl, metadataTmls);
    const idGuid = resp[0].response.header.id_guid;
    const searchParams = new URLSearchParams(window.location.search);
    const teamId = searchParams.get('teamId') || '';
    await getDomains(hostUrl, selectedProjectName, teamId, vercelAccessToken);

    return idGuid;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
};
