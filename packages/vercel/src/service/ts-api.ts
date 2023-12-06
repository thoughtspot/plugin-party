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

export const getMetadataList = async (hostUrl) => {
  const params = {
    category: 'ALL',
    offset: '0',
    pattern: '',
    showHidden: 'false',
    sort: 'MODIFIED',
    sortAscending: 'false',
    type: 'LOGICAL_TABLE',
  };

  const queryParams = new URLSearchParams(params);

  const response = await fetch(
    `${hostUrl}/callosum/v1/metadata/list?${queryParams}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      method: 'GET',
    }
  );
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
  tableIds,
  relationships,
  selectedDataSourceName
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
    let metadataTmls = result.object.map((test) => test.edoc);
    metadataTmls = metadataTmls.map((metadata) => {
      return metadata.replace(
        // eslint-disable-next-line no-useless-escape
        /\"name\": \"My Worksheet (\d+)\"/,
        `"name": "${selectedDataSourceName} $1"`
      );
    });
    const resp = await ImportWorksheetTML(hostUrl, metadataTmls);
    const idGuid = resp[0].response.header.id_guid;

    return idGuid;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
};

export const generateSecretKey = async (
  hostUrl,
  vercelAccessToken,
  selectedProjectName,
  idGuid
) => {
  console.log('insideapi', selectedProjectName);
  const searchParams = new URLSearchParams(window.location.search);
  const teamId = searchParams.get('teamId') || '';
  const secretKey = await getDomains(
    hostUrl,
    selectedProjectName,
    teamId,
    vercelAccessToken,
    idGuid
  );

  return secretKey;
};
