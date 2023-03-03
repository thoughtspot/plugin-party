import React from 'preact/compat';
import { Author } from 'widgets/lib/author';
import { Vertical, Horizontal } from 'widgets/lib/layout/flex-layout';
import './answerlist.scss';

export interface AnswerListProps {
  data?: any;
  pattern?: string;
  currentSegment?: string;
  onSegmentChange?: any;
  onChangePattern?: (pattern: string) => void;
  setTest?: any;
}

export const AnswerList = (props: AnswerListProps) => {
  return (
    <Vertical spacing="b" className="answerlist-container">
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
