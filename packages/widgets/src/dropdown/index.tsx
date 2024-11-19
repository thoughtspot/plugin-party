import { useState, useRef, useEffect } from 'preact/hooks';
import cx from 'classnames';
import styles from './index.module.scss';
import { Typography } from '../typography';
import { Icon } from '../icon';
import { Horizontal, Vertical } from '../layout/flex-layout';
import { Menu } from './menu';

export interface Options {
  /**
   * option title
   */
  title: string;
}

export interface DropdownProps {
  /**
   * List of options to be displayed in the dropdown
   */
  options: Options[];
  /** Initial place holder text
   * @default ''
   */
  placeholder?: string;
  /**
   * Any additional classnames for dropdown
   *
   * @default ''
   */
  className?: string;
  /**
   * call back event if the option is selected
   */
  onChange?: (data) => void;
  /** enable visibility of input control
   * used for filter list
   * @default false
   */
  isSearchEnabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  placeholder = '',
  className = '',
  onChange,
  isSearchEnabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={cx(
        styles.dropdownContainer,
        { [styles.expanded]: isOpen },
        className
      )}
    >
      <Horizontal className={styles.dropdownInput} onClick={toggleDropdown}>
        <Typography variant="p" noMargin className={styles.dropdownText}>
          {selectedOption ? selectedOption.title : placeholder}
        </Typography>
        <Vertical className={styles.iconWrapper}>
          <Icon
            name={isOpen ? 'rd-icon-chevron-up' : 'rd-icon-chevron-down'}
            iconClassName={styles.icon}
          />
        </Vertical>
      </Horizontal>
      {isOpen && (
        <Menu
          handleOptionSelect={handleOptionSelect}
          options={options}
          isSearchEnabled={isSearchEnabled}
        />
      )}
    </div>
  );
};
