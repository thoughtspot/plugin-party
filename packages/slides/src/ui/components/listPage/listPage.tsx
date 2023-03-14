import { Vertical, Horizontal } from 'widgets/lib/layout/flex-layout';
import { useEffect, useState } from 'preact/hooks';
import { Avatar } from 'widgets/lib/avatar';
import { Tab, TabItem } from 'widgets/lib/tab';
import { LiveboardList } from './liveboardlist/liveboardlist';
import { AnswerList } from './answerlist/answerlist';
import { getTSObjectList } from '../../services/api';
import './listPage.scss';

export interface ListPageProps {
  data?: any;
  pattern?: string;
  currentTab?: string;
  onChangeTab?: (tab: string) => void;
  onChangePattern?: (pattern: string) => void;
}

export const ListPage = (props: ListPageProps) => {
  const [data, setData] = useState({ liveboardList: [], answerList: [] });
  useEffect(() => {
    const genRandomKey = async () => {
      setData(await getTSObjectList());
    };
    genRandomKey();
  }, []);
  return (
    <Vertical spacing="j">
      <Tab selectedTabId="test-tab" className="tabHeader">
        <TabItem id={'test-tab'} name={'Test Tab'}>
          <LiveboardList data={data.liveboardList} />
        </TabItem>
        <TabItem
          id={'test-tab1'}
          name={'Test Tab1'}
          customHeader={
            <Vertical>
              <Avatar name={'Nirmay'} showName={false} size="xs"></Avatar>
            </Vertical>
          }
          // tabBottomBorder
        >
          <AnswerList data={data.answerList} />
        </TabItem>
      </Tab>
    </Vertical>
  );
};
