/**
 * @OnlyCurrentDoc
 */

/* eslint-disable vars-on-top */
/* eslint-disable no-var */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('ThoughtSpot')
    .addItem('Get data from ThoughtSpot', 'showTSSidebar')
    .addSeparator()
    .addItem('Reset instance url', 'resetTSInstance')
    .addToUi();
}

function showTSSidebar() {
  const widget = HtmlService.createHtmlOutputFromFile('index.html');
  widget.setTitle('ThoughtSpot');
  SpreadsheetApp.getUi().showSidebar(widget);
}

function showTSDialog() {
  const widget = HtmlService.createHtmlOutputFromFile('dialog.html');
  widget.setTitle('ThoughtSpot');
  SpreadsheetApp.getUi().showModalDialog(widget, 'Thoughtspot');
}

function resetTSInstance() {
  const userProps = PropertiesService.getUserProperties();
  userProps.deleteProperty('ts-cluster-url');
}

function getCandidateClusterUrl() {
  console.log('Hu0');
  const email = Session.getActiveUser().getEmail();
  const domain = email.substring(email.indexOf('@') + 1);
  let clusterName = domain.substring(0, domain.indexOf('.'));
  console.log('Hu1', email);
  let environment = 'thoughtspot';
  if (clusterName === 'thoughtspot') {
    clusterName = 'embed-1-do-not-delete';
    environment = 'thoughtspotstaging';
  }
  if (clusterName === 'gmail') {
    clusterName = 'my1';
  }
  console.log('reached', clusterName, environment);
  return `${clusterName}.${environment}.cloud`;
}

function getClusterUrl() {
  const userProps = PropertiesService.getUserProperties();
  if (userProps.getProperty('ts-cluster-url')) {
    return {
      url: userProps.getProperty('ts-cluster-url'),
      isCandidate: false,
    };
  }
  return {
    url: getCandidateClusterUrl(),
    isCandidate: true,
  };
}

function setClusterUrl(url) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('ts-cluster-url', url);
}

function setToken(token, ttl) {
  const userCache = CacheService.getUserCache();
  userCache.put('ts-auth-token', token, ttl);
}

function setQuery(
  query,
  startCell,
  sheetName,
  dataSource,
  ifColumnIsDate,
  previousDataCellRange
) {
  const userProps = PropertiesService.getDocumentProperties();
  // to fetch sheetName SpreadsheetApp.getActiveSheet().getName();
  userProps.setProperty(`tsquery-${sheetName}-${startCell}`, query);
  userProps.setProperty(`datasource-${sheetName}-${startCell}`, dataSource);
  userProps.setProperty(
    `ifColumnIsDate-${sheetName}-${startCell}`,
    JSON.stringify(ifColumnIsDate)
  );
  userProps.setProperty(
    `previousDataCellRange-${sheetName}-${startCell}`,
    JSON.stringify(previousDataCellRange)
  );
}

function getQuery(startCell, sheetName) {
  const userProps = PropertiesService.getDocumentProperties();
  return {
    query: userProps.getProperty(`tsquery-${sheetName}-${startCell}`),
    dataSource: userProps.getProperty(`datasource-${sheetName}-${startCell}`),
    ifColumnIsDate: JSON.parse(
      userProps.getProperty(`ifColumnIsDate-${sheetName}-${startCell}`)
    ),
    previousDataCellRange: JSON.parse(
      userProps.getProperty(`previousDataCellRange-${sheetName}-${startCell}`)
    ),
  };
}

function displayToast(name) {
  SpreadsheetApp.getActive().toast(`Hi there!${name}`);
}

function storeValue() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // ss is now the spreadsheet the script is associated with
  const sheet = ss.getSheets()[0]; // sheets are counted starting from 0
  // sheet is the first worksheet in the spreadsheet
  const cell = sheet.getRange('B2');
  cell.setValue('Success!');
}

function isCellSame(cell1, cell2) {
  return cell1.column === cell2.getColumn() && cell1.row === cell2.getRow();
}

function clearPrevious(cell, sheet) {
  const cache = CacheService.getDocumentCache();
  let previousDataCellRange: any = cache.get('previousDataCellRange');
  if (previousDataCellRange) {
    previousDataCellRange = JSON.parse(previousDataCellRange);
  }
  if (previousDataCellRange && isCellSame(previousDataCellRange.cell, cell)) {
    Logger.log('Clearing previous');
    const prevRange = previousDataCellRange.range;
    const range = sheet.getRange(
      prevRange.row,
      prevRange.column,
      prevRange.height,
      prevRange.width
    );
    range.clearContent();
  }
}

function formatDate(column, dateVal) {
  if (dateVal) {
    const value = dateVal.v ? dateVal.v.s : dateVal;
    const date = new Date(value * 1000);
    const timeZone = Session.getScriptTimeZone();
    return Utilities.formatDate(date, timeZone, 'MM/dd/yy, h:mm a');
  }
  return '';
}

function getQueryResult(query, sourceName) {
  var userCache = CacheService.getUserCache();
  var token = userCache.get('ts-auth-token');
  var clusterUrl = getClusterUrl().url;
  var url = 'https://plugin-party-sheets-staging.vercel.app/api/proxy';

  var queryResultPayload = {
    query_string: query,
    logical_table_identifier: sourceName,
    data_format: 'COMPACT',
    record_size: 1000000,
  };

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      clusterUrl,
      endpoint: 'api/rest/2.0/searchdata',
      token,
      payload: queryResultPayload,
    }),
  });

  var jsonResponse = JSON.parse(response.getContentText());

  return {
    colNames: jsonResponse.contents[0].column_names,
    rows: jsonResponse.contents[0].data_rows,
  };
}

function updateData(query, source, ifColumnIsDate) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  const cell = sheet.getActiveCell();
  clearPrevious(cell, sheet);
  // setting properties needed for refresh
  const { colNames, rows } = getQueryResult(query, source);
  const formattedRows = rows.map((row) => {
    const modifiedData = row.map((value, index) => {
      if (ifColumnIsDate[index]) {
        return formatDate(colNames[index], value);
      }
      if (value?.v) {
        return value.v?.s;
      }
      return value;
    });
    return modifiedData;
  });
  const range = sheet.getRange(
    cell.getRow(),
    cell.getColumn(),
    formattedRows.length + 1,
    colNames.length
  );
  const values = [colNames];
  Array.prototype.push.apply(values, formattedRows);
  range.setValues(values);
  var headerRow = sheet.getRange(
    cell.getRow(),
    cell.getColumn(),
    1,
    colNames.length
  );
  headerRow.setFontWeight('bold');
  const previousDataCellRange = {
    cell: { column: cell.getColumn(), row: cell.getRow() },
    range: {
      column: range.getColumn(),
      row: range.getRow(),
      height: range.getHeight(),
      width: range.getWidth(),
    },
  };
  setQuery(
    query,
    cell,
    sheetName,
    source,
    ifColumnIsDate,
    previousDataCellRange
  );
}

function updateDataa(header, data) {
  const sheet = SpreadsheetApp.getActiveSheet();
  // var sheet = ss.getSheets()[0]; // sheets are counted starting from 0
  const cell = sheet.getActiveCell();
  console.log(cell.getColumn());
  Logger.log(
    `${cell.getColumn()}`,
    `${cell.getRow()}`,
    `${data.length + 1}`,
    `${header.length}`
  );
  clearPrevious(cell, sheet);
  const range = sheet.getRange(
    cell.getRow(),
    cell.getColumn(),
    data.length + 1,
    header.length
  );
  const values = [header];
  Array.prototype.push.apply(values, data);
  range.setValues(values);
  var headerRow = sheet.getRange(
    cell.getRow(),
    cell.getColumn(),
    1,
    header.length
  );
  headerRow.setFontWeight('bold');
  const previousDataCellRange = {
    cell: { column: cell.getColumn(), row: cell.getRow() },
    range: {
      column: range.getColumn(),
      row: range.getRow(),
      height: range.getHeight(),
      width: range.getWidth(),
    },
  };
  const cache = CacheService.getDocumentCache();
  cache.put('previousDataCellRange', JSON.stringify(previousDataCellRange));
}

// refresh current sheet
function refreshData() {
  const userProps = PropertiesService.getDocumentProperties().getProperties();
  const sheetName = SpreadsheetApp.getActiveSheet().getName();
  const filteredProps = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key in userProps) {
    if (key.includes(sheetName)) {
      filteredProps[key] = userProps[key];
    }
  }
  console.log('ssese', userProps);
}
