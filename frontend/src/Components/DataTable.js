import React from 'react';

function DataTable(props) {
  let { tableName } = props.match.params;

  return (
    <span>Table: {convertTableNameParam(tableName)}</span>
  );
}

const convertTableNameParam = tableName => {
  let parts = tableName.split('-');
  parts = parts.map(str => str.charAt(0).toUpperCase() + str.slice(1));
  return parts.join('');
}

export default DataTable;
