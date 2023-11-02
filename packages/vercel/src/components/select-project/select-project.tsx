import React, { useEffect, useRef, useState } from 'react';
import { Checkbox } from 'antd';
import { Button } from 'widgets/lib/button';
import { useTranslations } from 'i18n';
import {
  getConnectionParams,
  getVercelAccessToken,
  vercelPromise,
} from '../../service/vercel-api';
import styles from './select-project.module.scss';

interface Project {
  id: string;
  name: string;
}

export const SelectProject = ({ updateProject }: any) => {
  const { t } = useTranslations();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, selectProject] = useState<string>('');
  const accessTokenRef = useRef('');
  const [projectIndex, setProjectIndex] = useState(0);
  const [hasPostgres, setHasPostgres] = useState<string[]>([]);
  const [projectEnvs, setProjectEnvs] = useState<any>([]);
  const [isConnectionPostgres, setIsConnectionPostgres] = useState(true);
  const [vercelToken, setVercelToken] = useState('');

  // In the init Method, I have generated vercel token and
  // get all the envs of all the projects and checking if
  // env has postgres then we are setting hasPosgres[index] as Yes
  const init = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const teamId = searchParams.get('teamId') || '';
    const accessToken = await getVercelAccessToken();
    setVercelToken(accessToken);
    const projectData = await vercelPromise(
      `https://api.vercel.com/v9/projects?teamId=${teamId}`,
      accessToken
    );
    const envVariablesPromises = projectData.projects.map((project) => {
      return vercelPromise(
        `https://api.vercel.com/v8/projects/${project.id}/env?teamId=${teamId}&decrypt=true&source=vercel-cli:pull`,
        accessToken
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
    accessTokenRef.current = accessToken;
    setProjects(projectData.projects);
  };

  useEffect(() => {
    init();
  }, []);

  const handleSelectProject = (value: string, index: number) => {
    selectProject(value);
    setProjectIndex(index);
  };
  const isPostgresSelected = () => {
    setIsConnectionPostgres(!isConnectionPostgres);
  };

  return (
    <div>
      {!projects.length ? (
        <div>{t.LOADING_PROJECTS}</div>
      ) : (
        <div className={styles.container}>
          <div className={styles.modal}>
            <div className={styles.header}>{t.SELECT_PROJECT_DESCRIPTION}</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.PROJECT_NAME}</th>
                  <th>{t.HAS_POSTGRES}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.id}>
                    <td>
                      <input
                        type="radio"
                        id={`myCheckbox_${project.id}`}
                        name="projectRadio"
                        checked={selectedProject === project.id}
                        onChange={() => handleSelectProject(project.id, index)}
                      />
                      {project.name}
                    </td>
                    <td>{hasPostgres[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  updateProject(
                    vercelToken,
                    selectedProject,
                    hasPostgres[projectIndex],
                    isConnectionPostgres,
                    projectEnvs[projectIndex]
                  );
                }}
                text={t.CONTINUE}
              ></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
