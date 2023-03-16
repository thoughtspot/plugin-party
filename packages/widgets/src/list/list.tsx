import cx from 'classnames';
import React, { useRef } from 'preact/compat';
import styles from './list-item.module.scss';
import { MemoListItem } from './list-item';
import { Vertical } from '../layout/flex-layout';
import { Icon } from '../icon';
import { Colors, Typography } from '../typography';
import { useLoader } from '../loader';
import { SearchBar } from './search-bar';

export interface RowDataProps {
  [key: string]: any;
}

export interface ListProps {
  /**
   * data: conatins id which will be unique for each `item` and `renderprops` which will be sent to render
   */
  data?: RowDataProps[];

  /**
   * Icon to br displayed when list is empty
   */
  emptyIcon?: string;

  /**
   * Message Tile to be displayed when list is empty
   */
  emptyMessageTile?: string;

  /**
   * Message Description to be displayed when list is empty
   */
  emptyMessageDescription?: string;

  /**
   * Boolean to set loading state
   */
  isLoading?: boolean;

  /**
   * Placeholder for search bar
   */
  searchPlaceholder?: string;

  /**
   * onRowClicked: callback event if row clicked
   */
  onRowClick?: (data: RowDataProps) => void;

  /**
   * Initial query in search bar
   */
  searchValue?: string;

  /**
   * Callback function to refetch list data
   */
  refetchData?: any;

  /**
   * State function to set searchValue
   */
  setSearchValue?: any;

  /**
   * True if lastBatch of the list is received
   */
  isLastBatch?: boolean;
}

export const List: React.FC<ListProps> = ({
  data,
  emptyIcon,
  emptyMessageTile,
  emptyMessageDescription,
  onRowClick,
  isLoading = false,
  searchPlaceholder = 'Search',
  searchValue = '',
  refetchData,
  setSearchValue,
  isLastBatch,
}: ListProps) => {
  const loader = useLoader();
  if (isLoading) {
    loader.show();
  } else {
    loader.hide();
  }
  const offset = useRef(0);
  const onScroll = (v) => {
    const scrollTop = v.target.scrollTop;
    const scrollHeight = v.target.scrollHeight;
    const clientHeight = v.target.clientHeight;
    if (
      scrollTop + clientHeight >= scrollHeight &&
      !isLoading &&
      data.length > 0 &&
      !isLastBatch
    ) {
      offset.current += 10;
      refetchData(offset.current);
    }
  };

  const onSearchChange = (searchStr) => {
    setSearchValue(searchStr);
    offset.current = 0;
  };

  const renderList = (listData) => {
    return listData.map((item) => {
      return (
        <div
          className={cx(styles.renderItemContainer)}
          onClick={() => onRowClick(item)}
          role="button"
          tabIndex={0}
        >
          <MemoListItem
            id={item.id}
            title={item.title}
            icon={item.icon}
            authorId={item.authorId}
            authorName={item.authorName}
            views={item.views}
            vizCount={item.vizCount}
          />
        </div>
      );
    });
  };
  return (
    <div className={styles.listContainer}>
      <SearchBar
        searchValue={searchValue}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={onSearchChange}
        className={styles.listSearchBar}
      ></SearchBar>
      <div class={styles.listWrapper} onScroll={onScroll}>
        {data?.length > 0 && renderList(data)}
        {!data?.length && !isLoading && (
          <Vertical hAlignContent="center" className={styles.emptyData}>
            <Icon name={emptyIcon} size="xl" />
            <Vertical className={styles.emptyDataText}>
              <Typography variant="h3" color={Colors.base}>
                {emptyMessageTile}
              </Typography>
              <Typography variant="p" color={Colors.gray}>
                {emptyMessageDescription}
              </Typography>
            </Vertical>
          </Vertical>
        )}
      </div>
    </div>
  );
};
