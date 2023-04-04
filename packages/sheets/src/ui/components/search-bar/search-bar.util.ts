import { getInitConfig } from '@thoughtspot/visual-embed-sdk';

const dateFormatter = Intl.DateTimeFormat();
function formatDate(column, dateVal) {
  if (dateVal) {
    const value = dateVal.v.s;
    return dateFormatter.format(value * 1000);
  }
  return '';
}

function transpose(matrix) {
  return Object.keys(matrix[0]).map((colNumber) =>
    matrix.map((rowNumber) => rowNumber[colNumber])
  );
}

export function parseHeaderAndRows(payload) {
  const colNames = payload.columns.map((col) => col.column.name);
  console.log(payload);
  const dataByColId = payload.data.columnDataLite.reduce((dict, col) => {
    dict[col.columnId] = col.dataValue;
    return dict;
  }, {});

  const colData = payload.columns.map((col) => {
    const id = col.column.id;
    const isDate = col.column.dataType === 'DATE';
    return isDate
      ? dataByColId[id].map((val) => formatDate(col.column, val))
      : dataByColId[id];
  });

  const rows = transpose(colData);
  console.log(colNames, rows);
  return { colNames, rows };
}

export function debounce(func, timeout = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
