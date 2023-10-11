import { Modal, Checkbox } from 'antd';
import React from 'react';

export const SelectTables = ({ connectedTablesName }: any) => {
  console.log('sdfsf', connectedTablesName);
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
                  <Checkbox>{connectedTableName}</Checkbox>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </div>
  );
};
