const dateFormatter = Intl.DateTimeFormat();
function formatDate(column, dateVal) {
  const value = dateVal.v.s;
  return dateFormatter.format(value * 1000);
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

  console.log(colData);
  const rows = transpose(colData);
  return { colNames, rows };
}
