import { useTranslations } from 'i18n';
import { Button } from 'widgets/lib/button';
import React, { useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import styles from './select-table.module.scss';
import { useAppContext } from '../../app.context';
import findConnectedComponents, {
  Routes,
} from '../connection/connection-utils';

export const SelectTables = () => {
  const loader = useLoader();
  loader.hide();
  const { t } = useTranslations();
  const [selectedDataSources, setSelectedDataSources] = useState<string>('');
  const {
    logicalTableList,
    setDataSourcesId,
    setRelationshipId,
    shouldCreateConnection,
    setSelectedDataSourceName,
  } = useAppContext();

  const sourceIds = logicalTableList.map((table) => table.header.id);
  const sourceNames = logicalTableList.map((table) => table.header.name);
  const tableRelationships = logicalTableList.map((table) => {
    if (shouldCreateConnection) {
      return table.destinationRelationships;
    }
    return table.relationships;
  });
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
  const connectedTablesNames = connectedTables.map(
    (connectedTable: string[]) => {
      return connectedTable
        .map((connectedTableIds) => tableIdToNameMap[connectedTableIds])
        .join(' - ');
    }
  );

  const updateDataSource = (selectDataSources: string) => {
    setSelectedDataSourceName(selectDataSources);
    const dataSourcesName = selectDataSources.split(' - ');
    const dataSourcesId = dataSourcesName.map(
      (dataSource) => tableNameToIdsMap?.[dataSource]
    );
    const checker = [].concat(...tableRelationships) as any;

    const relationshipIds = checker?.filter((dataSourceRelationship) => {
      if (
        dataSourcesId.includes(dataSourceRelationship.sourceTable) &&
        dataSourcesId.includes(dataSourceRelationship.destinationTable)
      ) {
        return true;
      }
      return false;
    });

    setDataSourcesId(dataSourcesId);
    setRelationshipId(relationshipIds);
    route(Routes.DOCUMENTS);
  };

  const handleSelectDataSources = (connectedTableName: string) => {
    setSelectedDataSources(connectedTableName);
  };

  return (
    <Vertical className={styles.container}>
      <Vertical className={styles.modal}>
        <Typography variant="h2" className={styles.header} noMargin>
          {t.SELECT_TABLES}
        </Typography>
        <Typography variant="h4" className={styles.subtitle} noMargin>
          {t.SELECT_TABLES_SUBTITLE}
        </Typography>
        <Vertical>
          {connectedTablesNames.map((connectedTableName: any) => (
            <div key={connectedTableName} className={styles.option}>
              <input
                type="radio"
                className={styles.radioButton}
                checked={connectedTableName === selectedDataSources}
                onChange={() => handleSelectDataSources(connectedTableName)}
              />
              {connectedTableName}
            </div>
          ))}
        </Vertical>
        <Vertical hAlignContent="center" className={styles.buttonContainer}>
          <Button
            className={styles.button}
            onClick={() => updateDataSource(selectedDataSources)}
            text={t.CONTINUE}
          ></Button>
        </Vertical>
      </Vertical>
    </Vertical>
  );
};
