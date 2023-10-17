import { Modal, Checkbox } from 'antd';
import React, { useState } from 'react';
import { Button } from 'widgets/lib/button';

export const SelectTables = ({
  connectedTablesName,
  updateDataSource,
}: any) => {
  const [selectDataSources, setSelectDataSources] = useState<string>('');
  const handleSelectDataSources = (connectedTableName: string) => {
    setSelectDataSources(connectedTableName);
  };
  return (
    <div>
      <Modal
        title="Please select the table with which you'd like to create worksheet."
        footer={null}
        visible={true}
        closable={false}
      >
        <table>
          <tbody>
            {connectedTablesName.map((connectedTableName: any) => (
              <tr>
                <td>
                  <Checkbox
                    checked={connectedTableName === selectDataSources}
                    onChange={() => handleSelectDataSources(connectedTableName)}
                  >
                    {connectedTableName}
                  </Checkbox>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <Button
            onClick={() => updateDataSource(selectDataSources)}
            text="Continue"
          ></Button>
        </div>
      </Modal>
    </div>
  );
};
