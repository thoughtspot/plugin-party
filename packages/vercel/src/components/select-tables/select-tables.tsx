import { useTranslations } from 'i18n';
import React, { useState } from 'react';
import { Button } from 'widgets/lib/button';
import styles from './select-table.module.scss';

export const SelectTables = ({
  connectedTablesName,
  updateDataSource,
}: any) => {
  const { t } = useTranslations();
  const [selectDataSources, setSelectDataSources] = useState<string>('');

  const handleSelectDataSources = (connectedTableName: string) => {
    setSelectDataSources(connectedTableName);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.header}>{t.SELECT_TABLES}</div>
      <div className={styles.options}>
        {connectedTablesName.map((connectedTableName: any) => (
          <div key={connectedTableName} className={styles.option}>
            <input
              type="radio"
              checked={connectedTableName === selectDataSources}
              onChange={() => handleSelectDataSources(connectedTableName)}
            />
            {connectedTableName}
          </div>
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <Button
          className={styles.button}
          onClick={() => updateDataSource(selectDataSources)}
          text={t.CONTINUE}
        ></Button>
      </div>
    </div>
  );
};
