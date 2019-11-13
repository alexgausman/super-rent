import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: null,
      tableDataRetrieved: false,
    }
    this.getSetRows = this.getSetRows.bind(this);
    this.upperCaseTableName = this.upperCaseTableName.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
  }

  componentDidMount() {
    this.getSetRows();
  }

  componentDidUpdate(prevProps, prevState) {
    const { tableName } = this.props.match.params.tableName;
    if (prevProps.match.params.tableName !== this.props.match.params.tableName) {
      this.setState({
        rows: null,
        tableDataRetrieved: false,
      }, () => this.getSetRows());
    }
    if (!prevState.tableDataRetrieved) {
      if (this.props.tablesInfo.length > 0 && this.state.rows) {
        this.setState({ tableDataRetrieved: true });
      }
    }
  }

  getSetRows() {
    axios.get('/tables/' + this.upperCaseTableName())
      .then(res => {
        this.setState({ rows: res.data.result });
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        const { query, error_message } = err.response.data;
        if (query && error_message) {
          this.props.logQuery(query, error_message);
        } else {
          console.log(err);
        }
      });
  }

  upperCaseTableName() {
    return convertTableNameParam(this.props.match.params.tableName);
  }

  lowerCaseTableName() {
    return this.upperCaseTableName().toLowerCase();
  }

  deleteRow(e) {
    const rowIndex = parseInt(e.target.getAttribute('rowindex'));
    const rowData = this.state.rows[rowIndex];
    axios.post(`/tables/${this.lowerCaseTableName()}/delete-row`, rowData)
      .then(res => {
        this.setState(prevState => {
          const newRows = [];
          prevState.rows.forEach(r => {
            if (JSON.stringify(r) !== JSON.stringify(rowData)) {
              newRows.push(r);
            }
          });
          return { rows: newRows };
        });
        this.props.logQuery(res.data.query);
      })
      .catch(err => console.log(err))
  }

  render() {
    let tableInfo;
    this.props.tablesInfo.forEach(t => {
      if (t.name === this.lowerCaseTableName() && t.columns) {
        tableInfo = t;
      }
    });

    let html = <span>{this.upperCaseTableName()} table does not exist.</span>
    if (tableInfo) {
      const items = (
        this.state.rows.map((r,i) => {
          return (
            <tr key={i}>
              {tableInfo.columns.map((c,i) => {
                const val = r[c.column_name];
                const text = val || (
                  <span className="font-italic font-weight-light text-muted">
                    NULL
                  </span>
                );
                return (
                  <td key={i} style={{ lineHeight: '1.8' }}>{text}</td>
                );
              })}
              <td style={{
                padding: '0.5rem 0.75rem',
              }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  rowindex={i}
                  onClick={this.deleteRow}
                  style={{
                    padding: '.275rem 1.2rem',
                  }}>
                  <i className="fas fa-trash-alt" style={{
                    pointerEvents: 'none'
                  }}></i>
                </button>
              </td>
            </tr>
          );
        })
      );

      html = (
        <div style={{ width: '100%', position: 'relative' }}>
          <div className="refresh-button" onClick={this.getSetRows}>
            <i className="fas fa-sync-alt"></i>
          </div>
          <h1 className="pb-4">{this.upperCaseTableName()}</h1>

          <table className="table table-responsive-lg table-hover">
            <thead>
              <tr>
                {tableInfo.columns.map((c,i) => (
                  <th key={i} scope="col">{c.column_name}</th>
                ))}
                <th key="actions" scope="col" className="font-weight-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items}
            </tbody>
          </table>
        </div>
      );
    }

    return html;
  }
}

const convertTableNameParam = tableName => {
  let parts = tableName.split('-');
  parts = parts.map(str => str.charAt(0).toUpperCase() + str.slice(1));
  return parts.join('');
}

DataTable.propTypes = {
  tablesInfo: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
  logQuery: PropTypes.func.isRequired,
}

export default DataTable;
