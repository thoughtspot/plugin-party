import React, { useEffect, useRef, useState } from 'react';
import { Modal, Select } from 'antd';
import { Typography } from 'widgets/lib/typography';
import { Button } from 'widgets/lib/button';
import { getEnvVariables, getVercelAccessToken, vercelPromise } from '../utils';
import initialprojects from './projects';

export const SelectProject = ({ updateProjects }: any) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, selectProject] = useState([] as any);
  const accessTokenRef = useRef('');
  const vercelConfigRef = useRef({} as any);

  const init = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const teamId = searchParams.get('teamId') || '';
    const accessToken = await getVercelAccessToken();
    const projectData = await vercelPromise(
      `https://api.vercel.com/v9/projects?teamId=${teamId}`,
      accessToken
    );
    accessTokenRef.current = accessToken;
    setProjects(projectData.projects);
  };

  useEffect(() => {
    init();
  }, []);

  const handleSelectProject = (value, index) => {
    const _selectedProjects = [...selectedProject];
    _selectedProjects[index] = value;
    selectProject(_selectedProjects);
  };

  console.log('select-project', projects);
  return (
    <div>
      {!projects.length ? (
        <div>Loading projects...</div>
      ) : (
        <Modal
          title="Choose how you want to continue?"
          footer={null}
          visible={true}
        >
          <div>
            <Typography variant="h4">
              {'Select project with database configuration: '}
            </Typography>
            <Select
              style={{ width: 120 }}
              onChange={(value) => handleSelectProject(value, 0)}
              options={projects}
              fieldNames={{
                label: 'name',
                value: 'id',
              }}
            />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <Typography variant="h4">
              {'Select project for authentication service: '}
            </Typography>
            <Select
              style={{ width: 120 }}
              onChange={(value) => handleSelectProject(value, 1)}
              options={projects}
              fieldNames={{
                label: 'name',
                value: 'id',
              }}
            />
          </div>
          <Button
            onClick={() =>
              updateProjects(selectedProject, accessTokenRef.current)
            }
            text="Continue"
          ></Button>
        </Modal>
      )}
    </div>
  );
};
