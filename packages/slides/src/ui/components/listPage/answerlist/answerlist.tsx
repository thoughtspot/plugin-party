import { useTranslations } from 'i18n';
import React from 'preact/compat';
import { Vertical } from 'widgets/lib/layout/flex-layout';
import { List } from 'widgets/lib/list';
import { route } from 'preact-router';
import { getPath, Routes } from '../../../routes';
import { useGetEmptyAnswerListMessageMap } from './answerlist.util';
import { useAppContext } from '../../app.context';

export const AnswerList = (props: any) => {
  const { t } = useTranslations();
  const { segmentIndex, searchPattern, setSearchPattern } = useAppContext();

  const emptyListMessageMap = useGetEmptyAnswerListMessageMap();

  const onRowClick = (row) => {
    route(
      getPath(Routes.ANSWER, {
        id: row.id,
      })
    );
  };

  return (
    <List
      data={props.data}
      onRowClick={onRowClick}
      refetchData={props.refetchData}
      emptyIcon={emptyListMessageMap[segmentIndex].emptyIcon}
      emptyMessageTile={emptyListMessageMap[segmentIndex].emptyMessageTile}
      emptyMessageDescription={
        emptyListMessageMap[segmentIndex].emptyMessageDescription
      }
      searchPlaceholder={t.ANSWER_SEARCH_PLACEHOLDER}
      isLoading={props.loading}
      searchValue={searchPattern}
      setSearchValue={setSearchPattern}
      isLastBatch={props.isLastBatch}
    ></List>
  );
};
