import React, { useEffect, useState } from 'react';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import { route } from 'preact-router';
import { Horizontal, Vertical } from 'widgets/lib/layout/flex-layout';
import { TableListView } from 'widgets/lib/table-list-view';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import { Typography } from 'widgets/lib/typography';
import { CircularLoader } from 'widgets/lib/circular-loader';
import { getConnectionParams, vercelPromise } from '../../service/vercel-api';
import styles from './select-project.module.scss';
import { useAppContext } from '../../app.context';
import { Routes } from '../connection/connection-utils';
import { getUserName } from '../../service/ts-api';
import { formatClusterUrl } from '../full-app/full-app.utils';

interface Project {
  id: string;
  name: string;
}

export const SelectProject = ({ vercelAccessToken, hostUrl }) => {
  const { t } = useTranslations();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string>('');
  const [projectIndex, setProjectIndex] = useState(0);
  const [hasPostgres, setHasPostgres] = useState<boolean[]>([]);
  const [projectEnvs, setProjectEnvs] = useState<any>([]);
  const [isConnectionPostgres, setConnectionPostgres] = useState(true);
  const [foundPostgresConnection, setFoundPostgresConnection] = useState(false);
  const {
    setSelectedProject,
    setHasAdminPrivilege,
    setHasPostgresConnection,
    setProjectEnv,
    setIsExistingDataSouce,
    setIsConnectionPostgres,
    setCurrentOrgId,
  } = useAppContext();
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const tsHostURL = formatClusterUrl(hostUrl.url);

  const hasNecessaryPrivilege = async () => {
    const tsUserInfo = await getUserName(tsHostURL);
    const userPrivilege = tsUserInfo.privileges;
    setCurrentOrgId(tsUserInfo.currentOrgId);
    localStorage.setItem('currentOrgId', tsUserInfo.currentOrgId);
    setHasAdminPrivilege(
      userPrivilege.includes('ADMINISTRATION') ||
        userPrivilege.includes('CONTROL_TRUSTED_AUTH')
    );
    if (
      !userPrivilege.includes('ADMINISTRATION') &&
      !userPrivilege.includes('DATAMANAGEMENT')
    ) {
      setErrorMessage({
        message: t.CREATE_CONNECTION_PRIVILEGE_REQUIRED,
        visible: true,
      });
    }
  };

  const fetchProjectAndEnv = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const teamId = searchParams.get('teamId') || '';

    // Fetching Vercel Projects selected by user
    const projectData = await vercelPromise(
      `https://api.vercel.com/v9/projects?teamId=${teamId}`,
      vercelAccessToken
    );

    // Fetching env Variables for all the selected projects
    setSelectedProjects(projectData.projects[0].id);
    const envVariablesPromises = projectData.projects.map((project) => {
      return vercelPromise(
        `https://api.vercel.com/v8/projects/${project.id}/env?teamId=${teamId}&decrypt=true&source=vercel-cli:pull`,
        vercelAccessToken
      );
    });

    const envVariables = await Promise.all(envVariablesPromises);
    const hasPostgresConnection: boolean[] = [];
    const projectEnv: any = [];
    for (let index = 0; index < envVariables.length; index++) {
      const envs = envVariables[index].envs;
      const connectionParams = getConnectionParams(envs);

      // We are setting connectionParams of Postgres
      // If we are finding postgres env then only
      // we are adding key value pair in connectionParams
      if (Object.keys(connectionParams).length === 5) {
        setFoundPostgresConnection(true);
        hasPostgresConnection.push(true);
      } else {
        hasPostgresConnection.push(false);
      }
      projectEnv.push(connectionParams);
    }
    setHasPostgres(hasPostgresConnection);
    setProjectEnvs(projectEnv);
    setProjects(projectData.projects);
  };

  useEffect(() => {
    hasNecessaryPrivilege();
    fetchProjectAndEnv();
  }, []);

  const handleSelectProject = (projectName: string, index: number) => {
    setSelectedProjects(projectName);
    setProjectIndex(index);
  };

  const updateProject = () => {
    setSelectedProject(selectedProjects);
    setHasPostgresConnection(hasPostgres[projectIndex]);
    setProjectEnv(projectEnvs[projectIndex]);
    setIsConnectionPostgres(isConnectionPostgres);
    route(Routes.APP_EMBED);
  };

  const isPostgresSelected = () => {
    setConnectionPostgres(!isConnectionPostgres);
  };

  const selectExistingDataSources = () => {
    setSelectedProject(selectedProjects);
    setProjectEnv(projectEnvs[projectIndex]);
    setIsExistingDataSouce(true);
    route(Routes.APP_EMBED);
  };

  return (
    <Vertical className={styles.container}>
      <ErrorBanner
        errorMessage={errorMessage.message}
        bannerType={BannerType.MESSAGE}
        errorCardButton={{
          name: '',
        }}
        showCloseIcon={false}
        showBanner={errorMessage.message !== '' && errorMessage.visible}
      />
      {!errorMessage.visible && (
        <>
          {!projects.length ? (
            <CircularLoader loadingText={t.LOADING_PROJECTS} />
          ) : (
            <>
              <Typography
                variant="h2"
                noMargin
                className={styles['item-title']}
              >
                {t.SELECT_PROJECT_HEADING}
              </Typography>
              <Typography
                className={styles.description}
                variant="p"
                htmlContent={t.SELECT_PROJECT_SUBTITLE}
              ></Typography>
              <Vertical className={styles.box}>
                <TableListView
                  textTitle={t.PROJECT_NAME}
                  textWithIconTitle={t.HAS_POSTGRES}
                  data={projects}
                  icon={hasPostgres.map((postgres) => {
                    return postgres ? 'correct' : 'wrong';
                  })}
                  iconText={hasPostgres.map((postgres) => {
                    return postgres ? 'Yes' : 'No';
                  })}
                  onRowClick={handleSelectProject}
                />
                <Horizontal className={styles.checkbox}>
                  <input
                    type="checkbox"
                    onChange={() => isPostgresSelected()}
                    checked={foundPostgresConnection && isConnectionPostgres}
                    disabled={!foundPostgresConnection}
                  ></input>
                  <Typography variant="p">
                    {t.USE_POSTGRES_CONNECTION}
                  </Typography>
                </Horizontal>
                <Horizontal
                  hAlignContent="center"
                  className={styles.buttonContainer}
                  spacing="a"
                >
                  <Button
                    type="SECONDARY"
                    onClick={() => selectExistingDataSources()}
                    text={t.SELECT_EXISTING_DATASOURCES}
                  ></Button>
                  <Button
                    onClick={() => {
                      updateProject();
                    }}
                    text={t.EDIT_CONNECTION}
                  ></Button>
                </Horizontal>
              </Vertical>
            </>
          )}
        </>
      )}
    </Vertical>
  );
};
