import _ from 'lodash';

export enum listCategory {
  FAVORITES,
  ALL,
  YOURS,
}
export interface listInput {
  type: string;
  category: listCategory;
  pattern?: string;
  recordOffset?: number;
  includeFav?: boolean;
  ids?: string[];
}

export const errorMessages = {
  REQUEST_CANCELLED_MESSAGE: 'Aborting previous search request',
};

export const listType = {
  LIVEBOARD: 'LIVEBOARD',
  ANSWER: 'ANSWER',
};

export const getIconType = (data) => {
  const metadataType = data.metadata_type;
  let resolvedObject;

  if (metadataType === 'LIVEBOARD') {
    const resolvedObjects = data.metadata_header.resolvedObjects;
    if (_.isEmpty(resolvedObjects)) return 'no-pinboards';
    resolvedObject = Object.values(resolvedObjects)[0];
  } else {
    resolvedObject = data.metadata_detail;
  }
  const sheet = resolvedObject.reportContent.sheets[0];
  const displayMode = sheet.sheetContent.displayMode;
  const viz = sheet.sheetContent.visualizations;
  let chartType = 'table';
  if (displayMode === 'TABLE_MODE') {
    return chartType;
  }
  viz.map((object) => {
    if (object.vizContent.chartType) chartType = object.vizContent.chartType;
    return chartType;
  });

  const icon = chartType?.toLowerCase().replace('_', '-');
  return icon;
};

export const getParsedListData = (data: any[]) => {
  const mappedData = data.map((object) => {
    const icon = getIconType(object);
    const authorName = object.metadata_header.authorDisplayName;
    const authorId = object.metadata_header.author;
    const resolvedObjects = object.metadata_header?.resolvedObjects;
    const views = object?.stats?.views || 10;
    const vizCount = resolvedObjects ? Object.keys(resolvedObjects).length : 0;
    return {
      id: object.metadata_id,
      title: object.metadata_name,
      icon,
      authorId,
      authorName,
      views: `${views} views`,
      vizCount,
    };
  });
  return mappedData;
};
