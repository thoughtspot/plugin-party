export const userCache = {};
export const userProperties = {};
export const email = 'test@example.com';

export function mockGoogleSesssion() {
  global.Session = {
    ...global?.Session,
    getActiveUser: () => {
      return {
        getEmail: () => {
          return email;
        },
      } as GoogleAppsScript.Base.User;
    },
  };
}

export function mockCacheService() {
  global.CacheService = {
    ...global?.CacheService,
    getUserCache: () => {
      return {
        get: (key: string) => userCache[key],
        put: (key: string, value: string) => {
          userCache[key] = value;
        },
      } as GoogleAppsScript.Cache.Cache;
    },
  };
}

export function mockPropertiesService() {
  global.PropertiesService = {
    ...global?.PropertiesService,
    getUserProperties: () => {
      return {
        deleteProperty: (key: string) => {
          delete userProperties[key];
        },
        getProperty: (key: string) => {
          return userProperties[key];
        },
        setProperty: (key: string, value: string) => {
          userProperties[key] = value;
        },
      } as GoogleAppsScript.Properties.Properties;
    },
  };
}

export function mockGoogleFetch() {
  global.UrlFetchApp = {
    ...global?.UrlFetchApp,
    fetchAll: (
      requests: (GoogleAppsScript.URL_Fetch.URLFetchRequest | string)[]
    ) => {
      return requests.map((req) => {
        return {
          getBlob: () => {
            return req as any;
          },
          getContent: () => {
            return req as any;
          },
        } as GoogleAppsScript.URL_Fetch.HTTPResponse;
      });
    },
  };
}

export function mockGoogleUtilities() {
  global.Utilities = {
    ...global?.Utilities,
    newBlob: (content) => {
      return content;
    },
  };
}
