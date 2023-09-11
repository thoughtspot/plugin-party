import React from 'react';
import { Button } from 'widgets/lib/button';

export const NextPage = ({ updatePath }: any) => {
  return (
    <div>
      <ul>
        <li>
          <Button
            onClick={() => updatePath('worksheet/create')}
            text="Create Worksheet"
          ></Button>
        </li>
        <li>
          <Button
            onClick={() => updatePath('answer')}
            text="Create answers from selected data sources"
          ></Button>
        </li>
        <li>
          <Button
            onClick={() => updatePath('documents')}
            text="GoToDocumentsPage"
          ></Button>
        </li>
      </ul>
    </div>
  );
};
