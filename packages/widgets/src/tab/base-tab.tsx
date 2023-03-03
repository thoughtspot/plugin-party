import cx from 'classnames';
import _ from 'lodash';
import React, { Children } from 'preact/compat';
import { TabItem, TabItemProps } from './tab-item';
import { useTab } from './tab-util';

const BaseTab = (
  children: any,
  selectedTabId: any,
  styles: any,
  headerClass: string,
  tabPanelClassName?: string,
  hideTabHeader?: boolean
) => {
  const { selectTab, selectedTab } = useTab(selectedTabId, children);

  const tabHeader = ({
    name,
    id,
    customHeader = null,
    onTabItemClick = _.noop,
  }: TabItemProps) => {
    const tabHeaderClass = cx(styles.headerItem, {
      [styles.headerItemSelected]: selectedTab === id,
    });

    const handleClick = (tabId: string) => {
      selectTab(tabId);
      onTabItemClick();
    };

    return (
      <li
        className={tabHeaderClass}
        role="presentation"
        key={id}
        tabIndex={0}
        id={id}
        data-testid={`tab-header-item-${id}`}
        onClick={() => handleClick(id)}
      >
        <a
          className={cx(styles.headerText)}
          aria-controls={`section-${id}`}
          aria-selected={selectedTab === id}
        >
          {customHeader || name}
        </a>
      </li>
    );
  };

  const renderTabContent = () =>
    React.Children.toArray(children).map((tabItem: any) => {
      /** reassigned children to child as children available on upper scope
       * to remove linting error
       */
      const { id, children: child } = tabItem.props as TabItemProps;
      const tabContentClass = cx(tabPanelClassName, styles.tabPanel);
      return (
        <section
          className={tabContentClass}
          aria-hidden={!(selectedTab === id)}
          key={id}
          id={`section-${id}`}
          aria-labelledby={id}
        >
          {child}
        </section>
      );
    });

  return (
    <>
      {!hideTabHeader && (
        <ul className={headerClass} role="tablist">
          {Children.toArray(children).map((tabItem: any) => {
            const tabItemProps = { ...tabItem.props };
            return tabHeader(tabItemProps);
          })}
        </ul>
      )}
      {/** Rendering Content */}
      {renderTabContent()}
    </>
  );
};

export { BaseTab };
