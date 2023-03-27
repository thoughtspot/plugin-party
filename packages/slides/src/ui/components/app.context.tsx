import React, { createContext, useContext } from 'preact/compat';
import { listCategory } from './listPage/listPage.util';

export interface AppConfigInterface {
  searchPattern?: string;
  segmentIndex?: any;
  userID?: string;
}

export enum AppConfigActions {
  SEARCH_PATTERN,
  SEGMENT_INDEX,
  USER_ID,
}

const defaultAppConfigValues = {
  searchPattern: '',
  segmentIndex: listCategory.ALL,
  userID: '',
};

const reducer: any = (state, action) => {
  switch (action.type) {
    case AppConfigActions.SEARCH_PATTERN:
      return {
        ...state,
        searchPattern: action.newSearchPattern,
      };
    case AppConfigActions.SEGMENT_INDEX:
      return {
        ...state,
        segmentIndex: action.newSegmentIndex,
      };
    case AppConfigActions.USER_ID:
      return {
        ...state,
        userID: action.newUserID,
      };
    default:
      return state;
  }
};

const AppContext = createContext<any>({});

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    ...defaultAppConfigValues,
  });
  const { searchPattern, segmentIndex, userID } = state;
  const setSearchPattern = (newSearchPattern: string) => {
    dispatch({ type: AppConfigActions.SEARCH_PATTERN, newSearchPattern });
  };

  const setSegmentIndex = (newSegmentIndex: any) => {
    dispatch({ type: AppConfigActions.SEGMENT_INDEX, newSegmentIndex });
  };

  const setUserID = (newUserID: string) => {
    dispatch({ type: AppConfigActions.USER_ID, newUserID });
  };
  return (
    <AppContext.Provider
      value={{
        segmentIndex,
        setSegmentIndex,
        searchPattern,
        setSearchPattern,
        userID,
        setUserID,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
