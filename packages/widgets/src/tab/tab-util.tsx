import React, { useState } from 'preact/compat';

export const useTab = (selectedTabId: any, children: preact.VNode) => {
  const defaultSelectedTabId =
    selectedTabId || (React.Children.toArray(children)[0] as any).props.id;
  const [selectedTab, setSelectedTab] = useState<string>(defaultSelectedTabId);

  const selectTab = (currentSelectedTab: string) => {
    setSelectedTab(currentSelectedTab);
  };

  return {
    selectedTab,
    selectTab,
  };
};
