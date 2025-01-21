import cx from 'classnames';
import React from 'preact/compat';
import { BaseTab } from './base-tab';
import styles from './tab.module.scss';
import { TabItem } from './tab-item';

export interface TabProps {
  /** Tab Content to be rendered. valid react node */
  children: preact.VNode<typeof TabItem>[] | preact.VNode<typeof TabItem>;

  /** default Selected Tab
   * @default first Tab item Id
   */
  selectedTabId?: string;

  /**
   * Any additional classnames for tab
   *
   * @default ''
   */
  className?: string;
  /**
   * Callback when a tab item is selected
   */
  onTabItemClick?: () => void;
  /**
   * Any additional classnames for tabPanel
   *
   * @default ''
   */
  tabPanelClassName?: string;

  hideTabHeader?: boolean;
  /**
   * Any additional classnames for tabHorizontal
   */
  tabHorizontalClassName?: string;
}

export const Tab: React.FC<TabProps> = ({
  children,
  selectedTabId = '',
  className = '',
  tabPanelClassName = '',
  tabHorizontalClassName = '',
  ...restProps
}: TabProps) => {
  const tabHeaderClass = cx(
    styles.tabHeader,
    className,
    styles.medium,
    styles.center
  );
  return (
    <div
      className={cx(styles.tabHorizontal, tabHorizontalClassName)}
      {...restProps}
    >
      {BaseTab(
        children,
        selectedTabId,
        styles,
        tabHeaderClass,
        tabPanelClassName,
        restProps.hideTabHeader
      )}
    </div>
  );
};
