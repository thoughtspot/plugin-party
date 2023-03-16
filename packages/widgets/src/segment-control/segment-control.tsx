import { cloneElement, FunctionComponent, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import _ from 'lodash';
import { Children } from 'preact/compat';
import { SegmentControlProps } from './segment-control-props';
import styles from './segment-control.module.scss';

export function cloneChildren(children: VNode<any>, props: any) {
  return Children.map(
    // remove null item
    Children.toArray(children).filter((child) => Boolean(child)),
    (item) => cloneElement(item as VNode<any>, props)
  );
}

type SelectedStyle = {
  width?: string;
  transform?: string;
};

/**
 * @example
 * <SegmentControl onSelect={onSelect} selectedIndex={1}>
      <SegmentedControlItem title={'Favorites'}></SegmentedControlItem>
      <SegmentedControlItem title={'All'}></SegmentedControlItem>
      <SegmentedControlItem title={'Yours'}></SegmentedControlItem>
    </SegmentControl>
 */

export const SegmentControl: FunctionComponent<SegmentControlProps> = (
  props: SegmentControlProps
) => {
  /** This is been done to check if the props is specific type */
  const { children, selectedIndex, onSelect = _.noop } = props;

  const setInitialSelectedIndex = (): number[] => {
    return [selectedIndex ? (selectedIndex as number) : 0];
  };

  const [currentSelectedIndex, setCurrentSelectedIndex] = useState<number[]>(
    setInitialSelectedIndex()
  );
  const [selectedItemStyle, setSelectedItemStyle] = useState<SelectedStyle>({});

  useEffect(() => {
    setCurrentSelectedIndex(selectedIndex ? [selectedIndex as number] : [0]);
  }, [selectedIndex]);

  const isItemSelected = (index: number): boolean =>
    index === currentSelectedIndex[currentSelectedIndex.indexOf(index)];

  const onSelectHandler = (
    index: number,
    { width, offsetX }: any,
    userClick: boolean
  ) => {
    const selectedStyle = {
      width: `${width}px`,
      transform: `translateX(${offsetX}px)`,
    };
    setSelectedItemStyle(selectedStyle);
    setCurrentSelectedIndex([index]);
    if (userClick) onSelect!(index as any);
  };

  return (
    <div className={styles.segmentedControl}>
      {Children.toArray(children).map((segmentItem: any, index: number) => {
        const segmentItemProps = {
          index,
          isSelected: isItemSelected(index),
          onSelect: onSelectHandler,
        };
        return cloneChildren(segmentItem, segmentItemProps);
      })}
      <div
        className={
          // this style has white background and if this is set before the
          // width is set, the whole segment will be in white color for few seconds
          selectedItemStyle?.width ? styles.selectedHighlight : ''
        }
        style={selectedItemStyle}
      >
        {' '}
      </div>
    </div>
  );
};
