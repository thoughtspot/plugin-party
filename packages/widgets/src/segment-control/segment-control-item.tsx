import cx from 'classnames';
import { useCallback, useEffect, useRef } from 'preact/compat';
import { Typography } from '../typography';
import { SegmentedControlItemProps } from './segment-control-props';
import { getElementPosition } from '../utils/base-control.util';
import styles from './segment-control.module.scss';

export const SegmentedControlItem: React.FC<SegmentedControlItemProps> = ({
  title,
  index,
  onSelect,
  isSelected,
}: SegmentedControlItemProps) => {
  const itemRef: React.RefObject<HTMLButtonElement> =
    useRef<HTMLButtonElement>(null);
  const initialItemStyle = cx(styles.segmentedItem, {
    [styles.selected]: isSelected,
  });

  const onSelectHandler = useCallback(
    (target: HTMLElement) => {
      const position = getElementPosition(target as HTMLElement);
      onSelect!(index!, position);
    },
    [index, onSelect]
  );

  useEffect(() => {
    if (isSelected && itemRef.current) {
      onSelectHandler(itemRef.current);
    }
  }, [isSelected]);

  const onClickHandler = (event: MouseEvent) => {
    onSelectHandler(event.target as HTMLElement);
  };

  return (
    <button
      type="button"
      className={initialItemStyle}
      onClick={onClickHandler}
      ref={itemRef}
    >
      <Typography variant="h6" className={styles.innerText}>
        {title}
      </Typography>
    </button>
  );
};
