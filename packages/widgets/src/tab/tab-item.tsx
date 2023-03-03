import React from 'preact/compat';

export interface TabItemProps {
  /**
   * uniqiue identifier for tab item.
   */
  id: string;
  /**
   * Name to display when showing the tab.
   */
  name: string;
  /**
   * Tab Item to display.
   */
  children: preact.VNode;
  /**
   *  tabitem index to be used for state
   */
  selectedId?: string;
  /**
   *  custom valid ReactNode to be render
   *  @default null
   */
  customHeader?: preact.VNode;
  /**
   * Callback when a tab item is selected
   */
  onTabItemClick?: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({ children }: TabItemProps) => (
  <div>{children}</div>
);
