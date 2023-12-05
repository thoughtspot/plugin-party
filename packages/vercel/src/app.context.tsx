import React, { createContext, useContext } from 'preact/compat';

export interface AppConfigInterface {
  selectedProject?: string;
  hasAdminPrivileges?: boolean;
  hasPostgresConnection?: boolean;
  projectEnv?: any;
  isConnectionPostgres?: boolean;
  logicalTableList: any;
  dataSourcesId: any;
  relationshipId: any;
  shouldCreateConnection: boolean;
  worksheetId: string;
  selectedDataSourceName: string;
  isExistingDataSouce: boolean;
}

export enum AppConfigActions {
  SELECTED_PROJECT,
  HAS_ADMIN_PRIVILEGES,
  HAS_POSTGRES_CONNECTION,
  PROJECT_ENV,
  IS_CONNECTION_POSTGRES,
  LOGICAL_TABLE_LIST,
  DATA_SOURCES_ID,
  RELATIONSHIP_ID,
  CREATE_CONNECTION,
  WORKSHEET_ID,
  SELECT_DATA_SOURCE_NAME,
  IS_EXISTING_DATA_SOURCE,
}

const defaultAppConfigValues = {
  selectedProject: '',
  hasAdminPrivileges: false,
  hasPostgresConnection: false,
  projectEnv: null,
  isConnectionPostgres: false,
  logicalTableList: null,
  dataSourcesId: null,
  relationshipId: null,
  shouldCreateConnection: false,
  worksheetId: '',
  selectedDataSourceName: '',
  isExistingDataSouce: false,
};

const reducer: any = (state, action) => {
  switch (action.type) {
    case AppConfigActions.SELECTED_PROJECT:
      return {
        ...state,
        selectedProject: action.newSelectedProject,
      };
    case AppConfigActions.HAS_ADMIN_PRIVILEGES:
      return {
        ...state,
        hasAdminPrivileges: action.adminPrivilege,
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
        shouldCreateConnection: action.newCreateConnection,
      };
    case AppConfigActions.WORKSHEET_ID:
      return {
        ...state,
        worksheetId: action.newWorksheetId,
      };
    case AppConfigActions.SELECT_DATA_SOURCE_NAME:
      return {
        ...state,
        selectedDataSourceName: action.newSelectedDataSourceName,
      };
    case AppConfigActions.IS_EXISTING_DATA_SOURCE:
      return {
        ...state,
        isExistingDataSouce: action.newIsExistingDataSouce,
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
    hasAdminPrivileges,
    hasPostgresConnection,
    projectEnv,
    isConnectionPostgres,
    logicalTableList,
    dataSourcesId,
    relationshipId,
    shouldCreateConnection,
    worksheetId,
    selectedDataSourceName,
    isExistingDataSouce,
  } = state;
  const setSelectedProject = (newSelectedProject: string) => {
    dispatch({ type: AppConfigActions.SELECTED_PROJECT, newSelectedProject });
  };

  const setHasAdminPrivilege = (adminPrivilege: boolean) => {
    dispatch({ type: AppConfigActions.HAS_ADMIN_PRIVILEGES, adminPrivilege });
  };

  const setHasPostgresConnection = (hasNewPostgresConnection: boolean) => {
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

  const setSelectedDataSourceName = (newSelectedDataSourceName: string) => {
    dispatch({
      type: AppConfigActions.SELECT_DATA_SOURCE_NAME,
      newSelectedDataSourceName,
    });
  };

  const setIsExistingDataSouce = (newIsExistingDataSouce: boolean) => {
    dispatch({
      type: AppConfigActions.IS_EXISTING_DATA_SOURCE,
      newIsExistingDataSouce,
    });
  };

  return (
    <AppContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        hasAdminPrivileges,
        setHasAdminPrivilege,
        hasPostgresConnection,
        setHasPostgresConnection,
        projectEnv,
        setProjectEnv,
        isConnectionPostgres,
        setIsConnectionPostgres,
        logicalTableList,
        setLogicalTableList,
        dataSourcesId,
        setDataSourcesId,
        relationshipId,
        setRelationshipId,
        shouldCreateConnection,
        setCreateConnection,
        worksheetId,
        setWorksheetId,
        selectedDataSourceName,
        setSelectedDataSourceName,
        isExistingDataSouce,
        setIsExistingDataSouce,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
