import { Vertical } from 'widgets/lib/layout/flex-layout';
import { Tab, TabItem } from 'widgets/lib/tab';
import { Icon } from 'widgets/lib/icon';
import { Typography } from 'widgets/lib/typography';
import React from 'preact';
import { route, useRouter } from 'preact-router';
import cx from 'classnames';
import { useTranslations } from 'i18n';
import {
  SegmentControl,
  SegmentedControlItem,
} from 'widgets/lib/segment-control';
import { useEffect } from 'preact/hooks';
import styles from './listPage.module.scss';
import { AnswerList } from './answerlist/answerlist';
import { LiveboardList } from './liveboardlist/liveboardlist';
import { Routes } from '../../routes';
import { listCategory, listType } from '../../services/services.util';
import { useAppContext } from '../app.context';
import { listTypeURL, tabHeaderIcon } from './listPage.util';
import { useMetadataSearch } from '../../services/list.services';

export const ListPage = () => {
  const [router] = useRouter();
  const { t } = useTranslations();

  const selectedTabId =
    router?.matches?.selectedTab === listTypeURL.LIVEBOARD_URL
      ? listType.LIVEBOARD
      : listType.ANSWER;

  const onLiveboardTabClick = () => {
    route(Routes.LIVEBOARDLIST);
  };

  const onAnswerTabClick = () => {
    route(Routes.ANSWERLIST);
  };

  const renderTabHeader = (tabId: string, type: string, icon: string) => {
    return (
      <Vertical
        hAlignContent="center"
        className={cx({
          [styles.tabIcon]: selectedTabId !== tabId,
        })}
      >
        <Icon name={icon} size="m"></Icon>
        <Typography variant="p" noMargin color="">
          {type}
        </Typography>
      </Vertical>
    );
  };

  const { segmentIndex, setSegmentIndex, searchPattern, userID } =
    useAppContext();

  const { data, error, loading, refetchData, resetData, isLastBatch } =
    useMetadataSearch(userID);

  useEffect(() => {
    resetData();
    refetchData(selectedTabId, searchPattern, segmentIndex, 0);
  }, [searchPattern, segmentIndex, selectedTabId]);

  const onSelect = (ind) => {
    if (ind === listCategory.ALL) setSegmentIndex(ind);
    else if (ind === listCategory.FAVORITES) setSegmentIndex(ind);
    else setSegmentIndex(ind);
  };

  const renderList = (tabId) => {
    if (tabId === listType.LIVEBOARD) {
      return (
        <LiveboardList
          data={data}
          loading={loading}
          isLastBatch={isLastBatch}
          refetchData={(offset) =>
            refetchData(listType.LIVEBOARD, searchPattern, segmentIndex, offset)
          }
        />
      );
    }
    return (
      <AnswerList
        data={data}
        loading={loading}
        isLastBatch={isLastBatch}
        refetchData={(offset) =>
          refetchData(listType.ANSWER, searchPattern, segmentIndex, offset)
        }
      />
    );
  };

  return (
    <Vertical className={styles.listPage}>
      <Vertical className={styles.segment}>
        <SegmentControl onSelect={onSelect} selectedIndex={segmentIndex}>
          <SegmentedControlItem title={t.FAVORITES}></SegmentedControlItem>
          <SegmentedControlItem title={t.ALL}></SegmentedControlItem>
          <SegmentedControlItem title={t.YOURS}></SegmentedControlItem>
        </SegmentControl>
      </Vertical>
      {renderList(selectedTabId)}
      <Tab selectedTabId={selectedTabId} className={styles.tabHeader}>
        <TabItem
          id={listType.ANSWER}
          onTabItemClick={onAnswerTabClick}
          customHeader={renderTabHeader(
            listType.ANSWER,
            t.ANSWERS,
            tabHeaderIcon.ANSWER_ICON
          )}
        ></TabItem>
        <TabItem
          id={listType.LIVEBOARD}
          onTabItemClick={onLiveboardTabClick}
          customHeader={renderTabHeader(
            listType.LIVEBOARD,
            t.LIVEBOARDS,
            tabHeaderIcon.LIVEBOARD_ICON
          )}
        ></TabItem>
      </Tab>
    </Vertical>
  );
};
