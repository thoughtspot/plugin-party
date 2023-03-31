import React, { useEffect, useRef, useState } from 'preact/hooks';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { List } from 'widgets/lib/list/list';
import { useTranslations } from 'i18n';
import { route } from 'preact-router';
import _ from 'lodash';
import { useGetEmptyLBListMessageMap } from './liveboardlist.util';
import { getPath, Routes } from '../../../routes';
import { useAppContext } from '../../app.context';

export const LiveboardList = (props: any) => {
  const { t } = useTranslations();
  const { segmentIndex, searchPattern, setSearchPattern } = useAppContext();

  const emptyLBListMessageMap = useGetEmptyLBListMessageMap();

  const onRowClick = (row) => {
    route(
      getPath(Routes.LIVEBOARD, {
        id: row.id,
      })
    );
  };
  return (
    <List
      data={props.data}
      onRowClick={onRowClick}
      refetchData={props.refetchData}
      emptyIcon={emptyLBListMessageMap[segmentIndex].emptyIcon}
      emptyMessageTile={emptyLBListMessageMap[segmentIndex].emptyMessageTile}
      emptyMessageDescription={
        emptyLBListMessageMap[segmentIndex].emptyMessageDescription
      }
      searchPlaceholder={t.LB_SEARCH_PLACEHOLDER}
      isLoading={props.loading}
      searchValue={searchPattern}
      setSearchValue={setSearchPattern}
      isLastBatch={props.isLastBatch}
    ></List>
  );
};
