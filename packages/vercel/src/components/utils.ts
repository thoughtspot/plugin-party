const CLIENT_ID = 'oac_ZRDkEzGSa8knXCmJ8XNAbkkN';
const CLIENT_SECRET = 'u7y8OoZROu3h1ymreAnCA7QV';

const presetCORS = 'localhost.*:443,.*:8080,.*:80,localhost:3000';

const envMapping = {
  PGUSER: 'user',
  PGPASSWORD: 'password',
  PGHOST: 'host',
  PGDATABASE: 'database',
};

const getConnectionParams = (envParams) => {
  const paramObj: any = {};
  envParams.forEach((element) => {
    if (envMapping[element.key]) {
      paramObj[envMapping[element.key]] = element.value;
    }
  });
  paramObj.port = '5432';
  return paramObj;
};

const vercelPromise = (endpoint, accessToken) => {
  return fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'get',
  }).then((res) => res.json());
};

export const getEnvVariables = async () => {
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
  const res = await response.json();
  const accessToken = res.access_token;
  const userData = await vercelPromise(
    `https://api.vercel.com/v2/user?teamId=${teamId}`,
    accessToken
  );
  const projectData = await vercelPromise(
    `https://api.vercel.com/v9/projects?teamId=${teamId}`,
    accessToken
  );
  console.log(userData);
  console.log(projectData);

  const projectDetails: any[] = [];
  const envPromises: any[] = [];
  if (projectData?.projects.length) {
    projectData.projects.map(async (project) => {
      envPromises.push(
        vercelPromise(
          `https://api.vercel.com/v8/projects/${project.id}/env?teamId=${teamId}&decrypt=true&source=vercel-cli:pull`,
          accessToken
        )
      );
      envPromises.push(
        vercelPromise(
          `https://api.vercel.com/v8/projects/${project.id}/domains?teamId=${teamId}`,
          accessToken
        )
      );
    });
  }
  const projectsResponses = await Promise.all(envPromises);
  let connectionConfig;
  let authUrl;
  let hostUrl;
  const projectIds: any[] = [];

  for (let index = 0; index < projectsResponses.length; index += 2) {
    const projectIndex = index / 2;
    const envs = projectsResponses[index].envs;
    const connectionParams = getConnectionParams(envs);
    if (Object.keys(connectionParams).length === 5) {
      connectionConfig = connectionParams;
      hostUrl = projectsResponses[index + 1].domains[0].name;
    } else authUrl = projectsResponses[index + 1].domains[0].name;

    projectIds.push(projectData.projects[projectIndex].id);
  }

  return {
    connectionConfig,
    authUrl,
    hostUrl,
    projectIds,
    accessToken,
    teamId,
  };
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

export const whiteListCSP = async (hostUrl, urlToWhiteList) => {
  try {
    const currentCSP = await secuirtySettingsPromise(hostUrl, 'CSP', 'GET');
    const currentCORS = await secuirtySettingsPromise(hostUrl, 'CORS', 'GET');

    const updatedCORSPayload = {
      configOperation: 'add',
      configOptions: [
        {
          optionKey: 'nginx_corshosts',
          optionValue: window.btoa(`${currentCORS.Data},${urlToWhiteList}`),
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

    secuirtySettingsPromise(hostUrl, 'CORS', 'POST', updatedCORSPayload);
    secuirtySettingsPromise(hostUrl, 'CSP', 'POST', updatedCSPPayload);
  } catch (error) {
    console.error('Network Error:', error);
  }
};

export const saveENV = async (hostUrl, vercelConfig) => {
  const { accessToken, teamId, projectIds, hostUrl: tsHostURL } = vercelConfig;
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
      // await saveEnv('TS_SECRET_KEY', rs?.Data?.token);

      projectIds.forEach((projectId) => {
        fetch(
          `https://api.vercel.com/v10/projects/${projectId}/env?upsert=true&teamId=${teamId}`,
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
                value: `https://${tsHostURL}`,
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
      });
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};
