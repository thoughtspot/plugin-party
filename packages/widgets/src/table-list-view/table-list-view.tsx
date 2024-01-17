import cx from 'classnames';
import React, { useState } from 'preact/compat';
import { Typography } from '../typography';
import styles from './table-list-view.module.scss';
import { MemoTableListItem } from './table-list-item';
import { Horizontal, Vertical } from '../layout/flex-layout';

export interface RowDataProps {
  [key: string]: any;
}

export interface ListProps {
  data?: RowDataProps[];

  textTitle?: string;

  textWithIconTitle?: string;

  icon?: string[];

  iconText?: string[];

  /**
   * onRowClicked: callback event if row clicked
   */
  onRowClick?: any;
}

export const TableListView: React.FC<ListProps> = ({
  textTitle,
  textWithIconTitle,
  icon,
  iconText,
  data,
  onRowClick,
}: ListProps) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const handleRowSelection = (projectName: string, index: number) => {
    onRowClick(projectName, index);
    setSelectedIndex(index);
  };
  const renderList = (listData: RowDataProps[]) => {
    return listData.map((item: RowDataProps, index: number) => {
      return (
        <Vertical
          className={cx(
            styles.renderItemContainer,
            index % 2 === 0 ? styles.evenRow : styles.oddRow
          )}
          onClick={() => handleRowSelection(item.name, index)}
          role="button"
          tabIndex={0}
        >
          <MemoTableListItem
            id={item.id}
            title={item.name}
            icon={icon?.[index] || ''}
            text={iconText?.[index] || ''}
            isChecked={
              selectedIndex === null ? index === 0 : selectedIndex === index
            }
          />
        </Vertical>
      );
    });
  };
  return (
    <div className={styles.listContainer}>
      <div class={styles.listContent}>
        <Vertical
          className={cx(styles.renderItemContainer, styles.oddRow)}
          tabIndex={0}
        >
          <Vertical vAlignContent="center" className={styles.itemWrapper}>
            <Horizontal className={styles.row} spacing="d">
              <Typography variant="p" noMargin>
                {textTitle}
              </Typography>
              <Horizontal spacing="a" className={styles.iconTextWrapper}>
                <Typography variant="p" noMargin>
                  {textWithIconTitle}
                </Typography>
              </Horizontal>
            </Horizontal>
          </Vertical>
        </Vertical>
        {renderList(data)}
      </div>
    </div>
  );
};
