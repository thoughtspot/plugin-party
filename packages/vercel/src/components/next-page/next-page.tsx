import React from 'react';
import { Button, Modal } from 'antd';

export const NextPage = ({ updatePath }: any) => {
  const optionsData = [
    {
      id: 1,
      title: 'Create Worksheet',
      description:
        'Create worksheet from the tables and columns of your database',
      path: 'worksheet/create',
    },
    {
      id: 2,
      title: 'Create answers from selected data source',
      description: 'Create answer from the data sources you have selected',
      path: 'answer',
    },
    {
      id: 3,
      title: 'Go to Documents Page',
      description: 'Refer to the documents on how to embed Thoughtspot',
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
            <Button type="primary" onClick={() => updatePath(option.path)}>
              {option.title}
            </Button>
          </div>
        ))}
      </Modal>
    </div>
  );
};
