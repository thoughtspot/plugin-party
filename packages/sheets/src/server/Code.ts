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
    .addItem('Analyze this sheet', 'showTSDialog')
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
    clusterName = 'champagne';
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

function updateData(header, data) {
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
