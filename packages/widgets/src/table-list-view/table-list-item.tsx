import React from 'preact/compat';
import { Horizontal, Vertical } from '../layout/flex-layout';
import { Typography } from '../typography';
import { Icon } from '../icon';
import styles from './table-list-view.module.scss';

export interface TableListProps {
  id?: string;
  icon?: string;
  title: string;
  text: string;
  isChecked: boolean;
}

export const TableListItem: React.FC<TableListProps> = ({
  id,
  icon = '',
  title,
  text,
  isChecked,
}: TableListProps) => {
  return (
    <Vertical vAlignContent="center" id={id} className={styles.itemWrapper}>
      <Horizontal className={styles.row} spacing="d">
        <Horizontal spacing="a" className={styles.row}>
          <input
            type="radio"
            className={styles.radio}
            checked={isChecked}
          ></input>
          <Typography variant="p" noMargin className={styles['item-title']}>
            {title}
          </Typography>
        </Horizontal>
        <Horizontal spacing="a" className={styles.textIcon}>
          {icon && <Icon name={`rd-icon-${icon}`} size="m" />}
          <Typography variant="p" noMargin>
            {text}
          </Typography>
        </Horizontal>
      </Horizontal>
    </Vertical>
  );
};

export const MemoTableListItem = React.memo(TableListItem);
