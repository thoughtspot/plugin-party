export interface SegmentControlProps {
  /**
   *  List of Segmented Items as children
   */
  children: any;

  /**
   *  Callback to be invoked when a segmented-control is selected
   */
  onSelect?: (index: number) => void;

  /**
   *  Get the current selected index, defaults to 0
   */
  selectedIndex?: number;
}

export interface SegmentedControlItemProps {
  /**
   *  Title of the Item
   *  This will be used to be displayed as the segmented-control item
   */
  title: string;

  /** handler on selecting an item */
  onSelect?: (
    index: number,
    position: { offsetX: number; width: number },
    userClick: boolean
  ) => void;

  /** current index of item
   * @default 0
   */
  index?: number;

  /** is the item is currently selected
   * @default false
   */
  isSelected?: boolean;
}
