import React from 'preact/compat';
import { Icon } from '../icon';
import { Horizontal, Vertical } from '../layout/flex-layout';
import styles from './list.module.scss';
import { Colors, Typography } from '../typography';
import { Author } from '../author';

export interface ListItemProps {
  id?: string;
  icon: string;
  title: string;
  authorName?: string;
  authorId?: string;
  views?: string;
  vizCount?: number;
}

export const ListItem: React.FC<ListItemProps> = ({
  id,
  icon,
  authorId,
  authorName,
  views,
  title,
  vizCount,
}: ListItemProps) => {
  const vizzes = vizCount > 0 ? `+${vizCount.toString()}` : '';
  return (
    <Vertical
      height={85}
      vAlignContent="center"
      className={styles.itemWrapper}
      id={id}
    >
      <Horizontal spacing="d" className={styles.item}>
        <Icon name={`rd-icon-${icon}`} size="xl" subscript={vizzes} />
        <Vertical spacing="f" className={styles.listItemDetails}>
          <Typography variant="p" noMargin className={styles['item-title']}>
            {title}
          </Typography>
          <Horizontal hAlignContent="center" className={styles.name}>
            <Author authorId={authorId} authorName={authorName}></Author>
            <Typography variant="h6" color={Colors.gray} noMargin>
              {views}
            </Typography>
          </Horizontal>
        </Vertical>
      </Horizontal>
    </Vertical>
  );
};

export const MemoListItem = React.memo(ListItem);
