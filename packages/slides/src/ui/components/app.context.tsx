import React, { createContext, useContext } from 'preact/compat';
import { listCategory } from './listPage/listPage.util';

export interface AppConfigInterface {
  searchPattern?: string;
  segmentIndex?: any;
  userID?: string;
  isPersonalisedViewSupported?: boolean;
  isPowerpoint?: boolean;
}

export enum AppConfigActions {
  SEARCH_PATTERN,
  SEGMENT_INDEX,
  USER_ID,
  IS_PERSONALISED_VIEW_SUPPORTED,
  IS_POWERPOINT,
}

const defaultAppConfigValues = {
  searchPattern: '',
  segmentIndex: listCategory.ALL,
  userID: '',
  isPersonalisedViewSupported: false,
  isPowerpoint: false,
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
    case AppConfigActions.IS_PERSONALISED_VIEW_SUPPORTED:
      return {
        ...state,
        isPersonalisedViewSupported: action.newIsPersonalisedViewSupported,
      };
    case AppConfigActions.IS_POWERPOINT:
      return {
        ...state,
        isPowerpoint: action.newIsPowerpoint,
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
  const {
    searchPattern,
    segmentIndex,
    userID,
    isPersonalisedViewSupported,
    isPowerpoint,
  } = state;
  const setSearchPattern = (newSearchPattern: string) => {
    dispatch({ type: AppConfigActions.SEARCH_PATTERN, newSearchPattern });
  };

  const setSegmentIndex = (newSegmentIndex: any) => {
    dispatch({ type: AppConfigActions.SEGMENT_INDEX, newSegmentIndex });
  };

  const setUserID = (newUserID: string) => {
    dispatch({ type: AppConfigActions.USER_ID, newUserID });
  };

  const setIsPersonalisedViewSupported = (
    newIsPersonalisedViewSupported: boolean
  ) => {
    dispatch({
      type: AppConfigActions.IS_PERSONALISED_VIEW_SUPPORTED,
      newIsPersonalisedViewSupported,
    });
  };

  const setIsPowerpoint = (newIsPowerpoint: boolean) => {
    dispatch({ type: AppConfigActions.IS_POWERPOINT, newIsPowerpoint });
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
        isPersonalisedViewSupported,
        setIsPersonalisedViewSupported,
        setIsPowerpoint,
        isPowerpoint,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
