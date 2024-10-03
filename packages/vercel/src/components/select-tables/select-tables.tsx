import { useTranslations } from 'i18n';
import { Button } from 'widgets/lib/button';
import React, { useState } from 'preact/hooks';
import { route } from 'preact-router';
import { useLoader } from 'widgets/lib/loader';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Typography } from 'widgets/lib/typography';
import { TableListView } from 'widgets/lib/table-list-view';
import styles from './select-table.module.scss';
import { useAppContext } from '../../app.context';
import findConnectedComponents, {
  Routes,
} from '../connection/connection-utils';

export const SelectTables = () => {
  const loader = useLoader();
  loader.hide();
  const { t } = useTranslations();
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
      return {
        name: connectedTable
          .map((connectedTableIds) => tableIdToNameMap[connectedTableIds])
          .join(' - '),
        joins: connectedTable.length > 1 ? 'Yes' : 'No',
      };
    }
  );
  const [selectedDataSources, setSelectedDataSources] = useState(
    connectedTablesNames[0].name
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
      <Typography variant="h2" className={styles.header} noMargin>
        {t.SELECT_TABLES}
      </Typography>
      <Typography variant="h4" className={styles.subtitle} noMargin>
        {t.SELECT_TABLES_SUBTITLE}
      </Typography>
      <Vertical className={styles.tableWrapper}>
        <TableListView
          textTitle="Tables Name"
          textWithIconTitle="Joins"
          onRowClick={handleSelectDataSources}
          data={connectedTablesNames}
          iconText={connectedTablesNames.map((tables: any) => {
            return tables.joins;
          })}
        ></TableListView>
      </Vertical>
      <Vertical hAlignContent="center" className={styles.buttonContainer}>
        <Button
          className={styles.button}
          onClick={() => updateDataSource(selectedDataSources)}
          text={t.CONTINUE}
          isDisabled={selectedDataSources === ''}
        ></Button>
      </Vertical>
    </Vertical>
  );
};
