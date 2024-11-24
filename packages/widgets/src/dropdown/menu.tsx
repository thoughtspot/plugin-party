import { useState, useMemo } from 'preact/hooks';
import { Typography } from '../typography';
import { Horizontal, Vertical } from '../layout/flex-layout';
import styles from './index.module.scss';
import { SearchBar } from './search-bar';

export const Menu = ({ handleOptionSelect, options, isSearchEnabled }) => {
  const [searchValue, setSearchValue] = useState('');

  const onSearchChange = (searchStr) => {
    setSearchValue(searchStr);
  };

  const onMenuItemClick = (option) => {
    handleOptionSelect(option);
  };

  // Use useMemo for optimization
  const filteredOptions = useMemo(() => {
    if (!isSearchEnabled) {
      return options;
    }
    return options.filter((option) =>
      option.title.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue, isSearchEnabled]);

  return (
    <Vertical className={styles.menuContainer}>
      {isSearchEnabled && (
        <SearchBar
          searchPlaceholder="Search"
          className={styles.searchBar}
          onSearchChange={onSearchChange}
          searchValue={searchValue}
        />
      )}
      <Vertical className={styles.dropdownMenu}>
        {filteredOptions.map((option, index) => (
          <Horizontal
            key={index}
            className={styles.textWrapper}
            onClick={() => onMenuItemClick(option)}
          >
            <Typography variant="p" noMargin className={styles.dropdownText}>
              {option.title}
            </Typography>
          </Horizontal>
        ))}
        {filteredOptions.length === 0 && isSearchEnabled && (
          <Typography variant="p" noMargin className={styles.noOptions}>
            No options found
          </Typography>
        )}
      </Vertical>
    </Vertical>
  );
};
