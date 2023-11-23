import React, { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import { route } from 'preact-router';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { TableListView } from 'widgets/lib/table-list-view';
import { BannerType, ErrorBanner } from 'widgets/lib/error-banner';
import { Typography } from 'widgets/lib/typography';
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
  const [selectedProject, selectProject] = useState<string>('');
  const [projectIndex, setProjectIndex] = useState(0);
  const [hasPostgres, setHasPostgres] = useState<string[]>([]);
  const [projectEnvs, setProjectEnvs] = useState<any>([]);
  const [isConnectionPostgres, setConnectionPostgres] = useState(true);
  const {
    setSelectedProject,
    setHasAdminPrivilege,
    setHasPostgresConnection,
    setProjectEnv,
    setIsConnectionPostgres,
  } = useAppContext();
  const [errorMessage, setErrorMessage] = useState({
    visible: false,
    message: '',
  });
  const tsHostURL = formatClusterUrl(hostUrl.url);

  const init = async () => {
    const tsUserInfo = await getUserName(tsHostURL);
    const userPrivilege = tsUserInfo.privileges;
    setHasAdminPrivilege(userPrivilege.includes('ADMINISTRATION'));
    if (
      !userPrivilege.includes('ADMINISTRATION') &&
      !userPrivilege.includes('DATAMANAGEMENT')
    ) {
      setErrorMessage({
        message: t.CREATE_CONNECTION_PRIVILEGE_REQUIRED,
        visible: true,
      });
    }
    const searchParams = new URLSearchParams(window.location.search);
    const teamId = searchParams.get('teamId') || '';
    const projectData = await vercelPromise(
      `https://api.vercel.com/v9/projects?teamId=${teamId}`,
      vercelAccessToken
    );
    const envVariablesPromises = projectData.projects.map((project) => {
      return vercelPromise(
        `https://api.vercel.com/v8/projects/${project.id}/env?teamId=${teamId}&decrypt=true&source=vercel-cli:pull`,
        vercelAccessToken
      );
    });

    const envVariables = await Promise.all(envVariablesPromises);
    const hasPostgresConnection: string[] = [];
    const projectEnv: any = [];
    for (let index = 0; index < envVariables.length; index++) {
      const envs = envVariables[index].envs;
      const connectionParams = getConnectionParams(envs);
      if (Object.keys(connectionParams).length === 5) {
        hasPostgresConnection.push('Yes');
      } else {
        hasPostgresConnection.push('No');
      }
      projectEnv.push(connectionParams);
    }
    setHasPostgres(hasPostgresConnection);
    setProjectEnvs(projectEnv);
    setProjects(projectData.projects);
  };

  useEffect(() => {
    init();
  }, []);

  const handleSelectProject = (projectName: string, index: number) => {
    selectProject(projectName);
    setProjectIndex(index);
  };

  const updateProject = () => {
    setSelectedProject(selectedProject);
    setHasPostgresConnection(hasPostgres[projectIndex]);
    setProjectEnv(projectEnvs[projectIndex]);
    setIsConnectionPostgres(isConnectionPostgres);
    route(Routes.APP_EMBED);
  };
  const isPostgresSelected = () => {
    setConnectionPostgres(!isConnectionPostgres);
  };

  return (
    <Vertical className={styles.container}>
      {!errorMessage.visible && !errorMessage.message && (
        <>
          {!projects.length ? (
            <div className={styles.loadingContainer}>
              <h1>{t.LOADING_PROJECTS}</h1>
              <div className={styles.loader}></div>
            </div>
          ) : (
            <>
              <Typography
                variant="h2"
                noMargin
                className={styles['item-title']}
              >
                {t.SELECT_PROJECT_DESCRIPTION}
              </Typography>
              <Vertical className={styles.box}>
                <TableListView
                  textTitle={t.PROJECT_NAME}
                  textWithIconTitle={t.HAS_POSTGRES}
                  data={projects}
                  icon={hasPostgres}
                  onRowClick={handleSelectProject}
                />
              </Vertical>
              <div className={styles.checkbox}>
                <Checkbox
                  onChange={() => isPostgresSelected()}
                  checked={isConnectionPostgres}
                >
                  {t.USE_POSTGRES_CONNECTION}
                </Checkbox>
              </div>
              <div className={styles.buttonContainer}>
                <Button
                  onClick={() => {
                    updateProject();
                  }}
                  text={t.CONTINUE}
                ></Button>
              </div>
            </>
          )}
        </>
      )}
      <ErrorBanner
        errorMessage={errorMessage.message}
        bannerType={BannerType.MESSAGE}
        errorCardButton={{
          name: '',
        }}
        showCloseIcon={false}
        showBanner={errorMessage.visible && !!errorMessage.message}
      />
    </Vertical>
  );
};
