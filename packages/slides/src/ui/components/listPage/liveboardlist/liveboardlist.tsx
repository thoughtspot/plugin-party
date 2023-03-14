import React from 'preact/hooks';
import { route } from 'preact-router';
import { Author } from 'widgets/lib/author';
import { Button } from 'widgets/lib/button';
import { Vertical, Horizontal } from 'widgets/lib/layout/flex-layout';
import './liveboardlist.scss';
import { Routes } from '../../../routes';

export interface LiveboardListProps {
  data?: any;
  pattern?: string;
  currentSegment?: string;
  onSegmentChange?: any;
  onChangePattern?: (pattern: string) => void;
}

export const LiveboardList = (props: LiveboardListProps) => {
  return (
    <Vertical spacing="b" className={'liveboardlist-container'}>
      <Button text={'Home'} onClick={() => route(Routes.HOME)}></Button>
      {props.data?.map((object) => {
        const authorName = object.metadata_header.authorDisplayName;
        const authorId = object.metadata_header.author;
        return (
          authorName && <Author authorName={authorName} authorId={authorId} />
        );
      })}
    </Vertical>
  );
};
