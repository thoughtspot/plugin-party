import { useTranslations } from 'i18n';
import { Button } from 'widgets/lib/button';
import React, { useState } from 'preact/hooks';
import { route } from 'preact-router';
import styles from './select-table.module.scss';
import { useAppContext } from '../../app.context';
import findConnectedComponents, {
  Routes,
} from '../connection/connection-utils';

export const SelectTables = () => {
  const { t } = useTranslations();
  const [selectedDataSources, setSelectedDataSources] = useState<string>('');
  const { logicalTableList, setDataSourcesId, setRelationshipId } =
    useAppContext();

  const sourceIds = logicalTableList.map((table) => table.header.id);
  const sourceNames = logicalTableList.map((table) => table.header.name);
  const tableRelationships = logicalTableList.map((table) =>
    table.relationships.concat(table.destinationRelationships)
  );

  const connectedTables = findConnectedComponents(
    sourceIds,
    tableRelationships
  );
  const tableIdToNameMap: { [id: string]: string } = {};
  const tableNameToIdsMap: { [id: string]: string } = {};

  for (let i = 0; i < sourceIds.length; i++) {
    tableIdToNameMap[sourceIds[i]] = sourceNames[i];
  }

  for (let i = 0; i < sourceIds.length; i++) {
    tableNameToIdsMap[sourceNames[i]] = sourceIds[i];
  }
  const connectedTablesNames = connectedTables.map((connectedTable) => {
    return connectedTable
      .map((connectedTableIds) => tableIdToNameMap[connectedTableIds])
      .join(' - ');
  });

  const updateDataSource = (selectDataSources: any) => {
    const dataSourcesName = selectDataSources.split(' - ');
    const dataSourcesId = dataSourcesName.map(
      (dataSource) => tableNameToIdsMap?.[dataSource]
    );

    const relationshipIds = tableRelationships
      ?.filter((dataSourceRelationship) => {
        if (
          dataSourceRelationship.length > 0 &&
          dataSourcesId.includes(dataSourceRelationship[0]?.sourceTable) &&
          dataSourcesId.includes(dataSourceRelationship[0]?.destinationTable)
        ) {
          return true;
        }
        return false;
      })
      .map((dataSourceRelationship) => dataSourceRelationship[0]);
    setDataSourcesId(dataSourcesId);
    setRelationshipId(relationshipIds);
    route(Routes.DOCUMENTS);
  };

  const handleSelectDataSources = (connectedTableName: string) => {
    setSelectedDataSources(connectedTableName);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.header}>{t.SELECT_TABLES}</div>
      <div className={styles.options}>
        {connectedTablesNames.map((connectedTableName: any) => (
          <div key={connectedTableName} className={styles.option}>
            <input
              type="radio"
              checked={connectedTableName === selectedDataSources}
              onChange={() => handleSelectDataSources(connectedTableName)}
            />
            {connectedTableName}
          </div>
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <Button
          className={styles.button}
          onClick={() => updateDataSource(selectedDataSources)}
          text={t.CONTINUE}
        ></Button>
      </div>
    </div>
  );
};
