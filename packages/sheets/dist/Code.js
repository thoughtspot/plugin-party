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
    var widget = HtmlService.createHtmlOutputFromFile('index.html');
    widget.setTitle('ThoughtSpot');
    SpreadsheetApp.getUi().showSidebar(widget);
}
function showTSDialog() {
    var widget = HtmlService.createHtmlOutputFromFile('dialog.html');
    widget.setTitle('ThoughtSpot');
    SpreadsheetApp.getUi().showModalDialog(widget, 'Thoughtspot');
}
function resetTSInstance() {
    var userProps = PropertiesService.getUserProperties();
    userProps.deleteProperty('ts-cluster-url');
}
function getCandidateClusterUrl() {
    console.log('Hu0');
    var email = Session.getActiveUser().getEmail();
    var domain = email.substring(email.indexOf('@') + 1);
    var clusterName = domain.substring(0, domain.indexOf('.'));
    console.log('Hu1', email);
    var environment = 'thoughtspot';
    if (clusterName === 'thoughtspot') {
        clusterName = 'champagne';
        environment = 'thoughtspotstaging';
    }
    if (clusterName === 'gmail') {
        clusterName = 'my1';
    }
    console.log('reached', clusterName, environment);
    return "".concat(clusterName, ".").concat(environment, ".cloud");
}
function getClusterUrl() {
    var userProps = PropertiesService.getUserProperties();
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
    var userProps = PropertiesService.getUserProperties();
    userProps.setProperty('ts-cluster-url', url);
}
function displayToast(name) {
    SpreadsheetApp.getActive().toast("Hi there!".concat(name));
}
function storeValue() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // ss is now the spreadsheet the script is associated with
    var sheet = ss.getSheets()[0]; // sheets are counted starting from 0
    // sheet is the first worksheet in the spreadsheet
    var cell = sheet.getRange('B2');
    cell.setValue('Success!');
}
function isCellSame(cell1, cell2) {
    return cell1.column === cell2.getColumn() && cell1.row === cell2.getRow();
}
function clearPrevious(cell, sheet) {
    var cache = CacheService.getDocumentCache();
    var previousDataCellRange = cache.get('previousDataCellRange');
    if (previousDataCellRange) {
        previousDataCellRange = JSON.parse(previousDataCellRange);
    }
    if (previousDataCellRange && isCellSame(previousDataCellRange.cell, cell)) {
        Logger.log('Clearing previous');
        var prevRange = previousDataCellRange.range;
        var range = sheet.getRange(prevRange.row, prevRange.column, prevRange.height, prevRange.width);
        range.clearContent();
    }
}
function updateData(header, data) {
    var sheet = SpreadsheetApp.getActiveSheet();
    // var sheet = ss.getSheets()[0]; // sheets are counted starting from 0
    var cell = sheet.getActiveCell();
    console.log(cell.getColumn());
    Logger.log("".concat(cell.getColumn()), "".concat(cell.getRow()), "".concat(data.length + 1), "".concat(header.length));
    clearPrevious(cell, sheet);
    var range = sheet.getRange(cell.getRow(), cell.getColumn(), data.length + 1, header.length);
    var values = [header];
    Array.prototype.push.apply(values, data);
    range.setValues(values);
    var headerRow = sheet.getRange(cell.getRow(), cell.getColumn(), 1, header.length);
    headerRow.setFontWeight('bold');
    var previousDataCellRange = {
        cell: { column: cell.getColumn(), row: cell.getRow() },
        range: {
            column: range.getColumn(),
            row: range.getRow(),
            height: range.getHeight(),
            width: range.getWidth(),
        },
    };
    var cache = CacheService.getDocumentCache();
    cache.put('previousDataCellRange', JSON.stringify(previousDataCellRange));
}
