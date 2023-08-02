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
  const metadataType = data?.metadata_type;
  let resolvedObject;

  if (metadataType === 'LIVEBOARD') {
    const resolvedObjects = data?.metadata_detail?.header?.resolvedObjects;
    if (_.isEmpty(resolvedObjects)) return 'no-pinboards';
    resolvedObject = Object.values(resolvedObjects)[0];
  } else {
    resolvedObject = data?.metadata_detail;
  }
  const sheet = resolvedObject?.reportContent?.sheets[0];
  const displayMode = sheet?.sheetContent?.displayMode;
  const viz = sheet?.sheetContent?.visualizations;
  let chartType = 'table';
  if (displayMode === 'TABLE_MODE') {
    return chartType;
  }
  viz.map((object) => {
    if (object?.vizContent?.chartType)
      chartType = object?.vizContent?.chartType;
    return chartType;
  });
  const icon = chartType?.toLowerCase().replace(/_/g, '-');
  return icon;
};

export const getParsedListData = (data: any) => {
  const mappedData = data.map((object) => {
    const icon = getIconType(object);
    const authorName = object?.metadata_detail?.header?.authorDisplayName;
    const authorId = object?.metadata_detail?.header.author;
    const resolvedObjects = object?.metadata_detail?.header?.resolvedObjects;
    const views = object?.stats?.views >= 0 ? object?.stats?.views : '-';
    const vizCount = resolvedObjects ? Object.keys(resolvedObjects)?.length : 0;
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

export const getIconTypeV1 = (detail) => {
  let visualization;
  if (detail[0]?.type === 'QUESTION_ANSWER_BOOK') {
    visualization = detail[0];
  } else {
    visualization = detail[0]?.answers[0];
  }

  let chartType = 'table';
  if (
    visualization.vizType === 'TABLE' ||
    visualization.vizType === 'HEADLINE'
  ) {
    return chartType;
  }
  chartType = visualization.chartType;
  const icon = chartType?.toLowerCase().replace(/_/g, '-');
  return icon;
};

export const getStructuredData = (header, details) => {
  const sparseDetailsArray = details?.objects;
  const sparseDetail = sparseDetailsArray?.filter(
    (object) => object.header.id === header.id
  );
  const viewCount = sparseDetail?.[0]?.stats?.views;
  let answers = [];
  if (sparseDetail?.[0]?.answers) {
    answers = sparseDetail?.[0]?.answers.filter(
      (answer) => answer.vizType !== 'FILTER'
    );
  }
  const dataItem = {
    id: header.id,
    title: header.name,
    authorId: header.author,
    authorName: header.authorDisplayName,
    views: `${viewCount} views`,
    icon: getIconTypeV1(sparseDetail),
    vizCount: answers.length,
  };

  return dataItem;
};
