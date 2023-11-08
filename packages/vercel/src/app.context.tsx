import React, { createContext, useContext } from 'preact/compat';

export interface AppConfigInterface {
  selectedProject?: string;
  vercelToken?: string;
  hasPostgresConnection?: string;
  projectEnv?: any;
  isConnectionPostgres?: boolean;
  logicalTableList: any;
  dataSourcesId: any;
  relationshipId: any;
  createConnection: boolean;
  worksheetId: string;
}

export enum AppConfigActions {
  SELECTED_PROJECT,
  VERCEL_TOKEN,
  HAS_POSTGRES_CONNECTION,
  PROJECT_ENV,
  IS_CONNECTION_POSTGRES,
  LOGICAL_TABLE_LIST,
  SELECT_DATA_SOURCES,
  DATA_SOURCES_ID,
  RELATIONSHIP_ID,
  CREATE_CONNECTION,
  WORKSHEET_ID,
}

const defaultAppConfigValues = {
  selectedProject: '',
  vercelToken: '',
  hasPostgresConnection: '',
  projectEnv: null,
  isConnectionPostgres: false,
  logicalTableList: null,
  selectDataSources: null,
  dataSourcesId: null,
  relationshipId: null,
  createConnection: false,
  worksheetId: '',
};

const reducer: any = (state, action) => {
  switch (action.type) {
    case AppConfigActions.SELECTED_PROJECT:
      return {
        ...state,
        selectedProject: action.newSelectedProject,
      };
    case AppConfigActions.VERCEL_TOKEN:
      return {
        ...state,
        vercelToken: action.newVercelToken,
      };
    case AppConfigActions.HAS_POSTGRES_CONNECTION:
      return {
        ...state,
        hasPostgresConnection: action.hasNewPostgresConnection,
      };
    case AppConfigActions.PROJECT_ENV:
      return {
        ...state,
        projectEnv: action.newProjectEnv,
      };
    case AppConfigActions.IS_CONNECTION_POSTGRES:
      return {
        ...state,
        isConnectionPostgres: action.isPostgres,
      };
    case AppConfigActions.LOGICAL_TABLE_LIST:
      return {
        ...state,
        logicalTableList: action.newLogicalTableList,
      };
    case AppConfigActions.SELECT_DATA_SOURCES:
      return {
        ...state,
        selecteDataSources: action.newSelectDataSources,
      };
    case AppConfigActions.DATA_SOURCES_ID:
      return {
        ...state,
        dataSourcesId: action.newDataSourcesId,
      };
    case AppConfigActions.RELATIONSHIP_ID:
      return {
        ...state,
        relationshipId: action.newRelationshipId,
      };
    case AppConfigActions.CREATE_CONNECTION:
      return {
        ...state,
        createConnection: action.newCreateConnection,
      };
    case AppConfigActions.WORKSHEET_ID:
      return {
        ...state,
        worksheetId: action.newWorksheetId,
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
    selectedProject,
    vercelToken,
    hasPostgresConnection,
    projectEnv,
    isConnectionPostgres,
    logicalTableList,
    selectDataSources,
    dataSourcesId,
    relationshipId,
    createConnection,
    worksheetId,
  } = state;
  const setSelectedProject = (newSelectedProject: string) => {
    dispatch({ type: AppConfigActions.SELECTED_PROJECT, newSelectedProject });
  };
  const setVercelToken = (newVercelToken: string) => {
    dispatch({ type: AppConfigActions.VERCEL_TOKEN, newVercelToken });
  };

  const setHasPostgresConnection = (hasNewPostgresConnection: string) => {
    dispatch({
      type: AppConfigActions.HAS_POSTGRES_CONNECTION,
      hasNewPostgresConnection,
    });
  };

  const setProjectEnv = (newProjectEnv: any) => {
    dispatch({
      type: AppConfigActions.PROJECT_ENV,
      newProjectEnv,
    });
  };

  const setIsConnectionPostgres = (isPostgres: boolean) => {
    dispatch({
      type: AppConfigActions.IS_CONNECTION_POSTGRES,
      isPostgres,
    });
  };

  const setLogicalTableList = (newLogicalTableList: any) => {
    dispatch({
      type: AppConfigActions.LOGICAL_TABLE_LIST,
      newLogicalTableList,
    });
  };

  const setSelectDataSources = (newSelectDataSources: any) => {
    dispatch({
      type: AppConfigActions.SELECT_DATA_SOURCES,
      newSelectDataSources,
    });
  };

  const setDataSourcesId = (newDataSourcesId: any) => {
    dispatch({
      type: AppConfigActions.DATA_SOURCES_ID,
      newDataSourcesId,
    });
  };

  const setRelationshipId = (newRelationshipId: any) => {
    dispatch({
      type: AppConfigActions.RELATIONSHIP_ID,
      newRelationshipId,
    });
  };

  const setCreateConnection = (newCreateConnection: boolean) => {
    dispatch({
      type: AppConfigActions.CREATE_CONNECTION,
      newCreateConnection,
    });
  };

  const setWorksheetId = (newWorksheetId: string) => {
    dispatch({
      type: AppConfigActions.WORKSHEET_ID,
      newWorksheetId,
    });
  };

  return (
    <AppContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        vercelToken,
        setVercelToken,
        hasPostgresConnection,
        setHasPostgresConnection,
        projectEnv,
        setProjectEnv,
        isConnectionPostgres,
        setIsConnectionPostgres,
        logicalTableList,
        setLogicalTableList,
        selectDataSources,
        setSelectDataSources,
        dataSourcesId,
        setDataSourcesId,
        relationshipId,
        setRelationshipId,
        createConnection,
        setCreateConnection,
        worksheetId,
        setWorksheetId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
