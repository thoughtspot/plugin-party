import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Modal } from 'antd';
import { Button } from 'widgets/lib/button';
import {
  getConnectionParams,
  getVercelAccessToken,
  vercelPromise,
} from '../utils';
import styles from './select-project.module.scss';

interface Project {
  id: string;
  name: string;
}

export const SelectProject = ({ updateProject }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, selectProject] = useState<string>('');
  const accessTokenRef = useRef('');
  const [projectIndex, setProjectIndex] = useState(0);
  const [hasPostgres, setHasPostgres] = useState<string[]>([]);
  const [projectEnvs, setProjectEnvs] = useState<any>([]);
  const [isConnectionPostgres, setIsConnectionPostgres] = useState(true);

  // In the init Method, I have generated vercel token and
  // get all the envs of all the projects and checking if
  // env has postgres then we are setting hasPosgres[index] as Yes
  const init = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const teamId = searchParams.get('teamId') || '';
    const accessToken = await getVercelAccessToken();
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
        <div>Loading projects...</div>
      ) : (
        <div className={styles.modal}>
          <Modal
            title="Please choose the project with which you'd like to integrate ThoughtSpot."
            footer={null}
            visible={true}
            closable={false}
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <td>Project Name</td>
                  <td>Has Postgres</td>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.id}>
                    <td>
                      <Checkbox
                        checked={selectedProject === project.id}
                        onChange={() => handleSelectProject(project.id, index)}
                      >
                        {project.name}
                      </Checkbox>
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
                Use postgres connection from the project if available
              </Checkbox>
            </div>
            <div className={styles.button}>
              <Button
                onClick={() => {
                  updateProject(
                    selectedProject,
                    hasPostgres[projectIndex],
                    isConnectionPostgres,
                    projectEnvs[projectIndex]
                  );
                }}
                text="Continue"
              ></Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};
