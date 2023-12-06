const CLIENT_ID = 'oac_ZRDkEzGSa8knXCmJ8XNAbkkN';
const CLIENT_SECRET = 'u7y8OoZROu3h1ymreAnCA7QV';

const envMapping = {
  PGUSER: 'user',
  PGPASSWORD: 'password',
  PGHOST: 'host',
  PGDATABASE: 'database',
};

export const getConnectionParams = (envParams) => {
  const paramObj: any = {};
  envParams.forEach((element) => {
    if (envMapping[element.key]) {
      paramObj[envMapping[element.key]] = element.value;
    }
  });
  paramObj.port = '5432';
  return paramObj;
};

export const vercelPromise = async (endpoint: string, accessToken: string) => {
  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'get',
  });
  return res.json();
};

export const getVercelAccessToken = async () => {
  const searchParams = new URLSearchParams(window.location.search);
  const accessCode = searchParams.get('code') || '';
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
  const res = await response.json();
  const accessToken = res.access_token;
  return accessToken;
};

export const getCurrentUserInfo = async (accessToken: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  const teamId = searchParams.get('teamId') || '';
  const response = await fetch(
    `https://api.vercel.com/v2/user?teamId=${teamId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'get',
    }
  );

  return response.json();
};

const secuirtySettingsPromise = async (hostUrl, type, method, payload?) => {
  const endpoint = type === 'CSP' ? 'nginxcsp' : 'nginxcors?view_mode=all';
  return fetch(`${hostUrl}/managementconsole/admin-api/${endpoint}`, {
    headers: {
      accept: 'application/json',
      'content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include',
    method,
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  }).then((res) => res.json());
};

export const whiteListCSP = async (hostUrl: string, urlToWhiteList: string) => {
  try {
    const currentCSP = await secuirtySettingsPromise(hostUrl, 'CSP', 'GET');
    const currentCORS = await secuirtySettingsPromise(hostUrl, 'CORS', 'GET');

    const updatedCORSPayload = {
      configOperation: 'add',
      configOptions: [
        {
          optionKey: 'nginx_corshosts',
          optionValue: window.btoa(
            `${currentCORS.Data},${urlToWhiteList},.*.stackblitz.io`
          ),
        },
      ],
    };

    const updatedCSPPayload = {
      configOperation: 'add',
      configOptions: currentCSP.Data.configs.map((config) => {
        let value = config.value;
        if (config.configName === 'nginx_csp_frame_ancestors')
          value = `${value},https://${urlToWhiteList}`;
        return {
          optionKey: config.configName,
          optionValue: window.btoa(value),
        };
      }),
    };

    await secuirtySettingsPromise(hostUrl, 'CORS', 'POST', updatedCORSPayload);
    await secuirtySettingsPromise(hostUrl, 'CSP', 'POST', updatedCSPPayload);
  } catch (error) {
    console.error('Network Error:', error);
  }
};

export const saveENV = async (hostUrl: string, vercelConfig: any) => {
  const { accessToken, teamId, projectIds, tsHostURL } = vercelConfig;
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
      const secretKey = rs?.Data?.token;
      await fetch(
        `https://api.vercel.com/v10/projects/${projectIds}/env?upsert=true&teamId=${teamId}`,
        {
          body: JSON.stringify([
            {
              key: 'TS_SECRET_KEY',
              value: secretKey,
              type: 'encrypted',
              target: ['production', 'preview'],
            },
            {
              key: 'TS_HOST',
              value: hostUrl,
              type: 'plain',
              target: ['production', 'preview'],
            },
          ]),
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          method: 'post',
        }
      );

      return secretKey;
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
  return null;
};

export const saveDeployedUrlEnv = async () => {
  const url = window.location.search;
  const searchParams = url.split('?');
  const addedSearchParam = new URLSearchParams(searchParams[1]);
  const accessToken = addedSearchParam.get('token') || '';
  const teamId = addedSearchParam.get('teamId') || '';
  const projectIds = addedSearchParam.get('project') || '';
  const deploymentUrlSearchParam = new URLSearchParams(searchParams[2]);
  const deploymentUrl = deploymentUrlSearchParam.get('deployment-url');
  await fetch(
    `https://api.vercel.com/v10/projects/${projectIds}/env?upsert=true&teamId=${teamId}`,
    {
      body: JSON.stringify([
        {
          key: 'AUTH_SERVICE_URL',
          value: deploymentUrl,
          type: 'plain',
          target: ['production', 'preview'],
        },
      ]),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'post',
    }
  );
};

export const getDomains = async (
  hostUrl,
  projectIds,
  teamId,
  accessToken,
  idGuid
) => {
  const domainConfig = await vercelPromise(
    `https://api.vercel.com/v8/projects/${projectIds}/domains?teamId=${teamId}`,
    accessToken
  );
  const tsHostURL = domainConfig.domains[0].name;
  await whiteListCSP(hostUrl, tsHostURL);
  const secretKey = await saveENV(hostUrl, {
    accessToken,
    teamId,
    projectIds,
    hostUrl,
    idGuid,
  });

  return secretKey;
};
