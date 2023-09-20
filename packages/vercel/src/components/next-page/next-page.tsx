import React from 'react';
import { Modal } from 'antd';
import { Button } from 'widgets/lib/button';

export const NextPage = ({ updatePath }: any) => {
  const optionsData = [
    {
      id: 1,
      title: 'Create A Datamodel',
      description: 'Create a new data model from the imported tables from your database',
      path: 'worksheet/create',
    },
    {
      id: 2,
      title: 'Create a liveboard using search',
      description: 'Create an answer from your data and pin it to a new livebaord',
      path: 'answer',
    },
    {
      id: 3,
      title: 'Go to Documents Page',
      description: 'Complete the integration and Refer to the documents on how to embed Thoughtspot',
      path: 'documents',
    },
  ];
  return (
    <div>
      <Modal
        title="Choose how you want to continue?"
        footer={null}
        visible={true}
      >
        {optionsData.map((option) => (
          <div key={option.id} style={{ marginBottom: '16px' }}>
            <p>{option.description}</p>
            <Button
              onClick={() => updatePath(option.path)}
              text={option.title}
            ></Button>
          </div>
        ))}
      </Modal>
    </div>
  );
};
