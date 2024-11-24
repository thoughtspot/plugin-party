import _ from 'lodash';
import React, { ChangeEvent, useCallback } from 'preact/compat';
import { Icon } from '../icon';
import { Horizontal, Vertical, View } from '../layout/flex-layout';
import { Input } from '../input';
import styles from './index.module.scss';

export interface SearchBarProps {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (searchTerm: string) => void;
  searchDebounceTime?: number;
  className?: string;
}

export const SearchBarDataTestId = 'search-bar';

export const SearchBar: React.FC<SearchBarProps> = ({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  searchDebounceTime = 0,
  className = '',
}: SearchBarProps) => {
  const debouncedSearch = useCallback(
    _.debounce((q: string) => {
      onSearchChange(q);
    }, searchDebounceTime),
    []
  );
  const onChange = (event: ChangeEvent<HTMLInputElement>) =>
    debouncedSearch((event.target as HTMLInputElement).value);
  return (
    <Vertical className={styles.listSearchBarWrapper}>
      <Horizontal vAlignContent="center" className={className}>
        <Icon name="rd-icon-magnifying-glass-small" size="s"></Icon>
        <Input
          value={searchValue}
          onChange={onChange}
          placeholder={searchPlaceholder}
          data-testid={SearchBarDataTestId}
          type="TEXT"
          id={searchValue}
          className={styles.input}
        />
      </Horizontal>
    </Vertical>
  );
};
