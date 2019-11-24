import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import pluralize from 'pluralize';

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: null,
      tableInfoSaved: null,
      dataAlreadyRetrieved: false,
    }
    this.getTableInfoFromProps = this.getTableInfoFromProps.bind(this);
    this.getSetRows = this.getSetRows.bind(this);
    this.upperCaseTableName = this.upperCaseTableName.bind(this);
    this.insertRow = this.insertRow.bind(this);
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
        tableInfoSaved: null,
        dataAlreadyRetrieved: false,
      }, () => this.getSetRows());
    }
    if (!prevState.dataAlreadyRetrieved) {
      if (this.props.tablesInfo.length > 0 && this.state.rows) {
        const tableInfo = this.getTableInfoFromProps();
        if (tableInfo) {
          this.setState({
            tableInfoSaved: tableInfo,
            dataAlreadyRetrieved: true,
          });
        }
      }
    }
  }

  getTableInfoFromProps() {
    let tableInfo;
    this.props.tablesInfo.forEach(t => {
      if (t.name === this.lowerCaseTableName() && t.columns) {
        tableInfo = t;
      }
    });
    return tableInfo;
  }

  getSetRows() {
    axios.get('/tables/' + this.lowerCaseTableName())
      .then(res => {
        this.setState({ rows: res.data.result });
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            this.setState({
              rows: null,
              tableInfoSaved: this.getTableInfoFromProps(),
              dataAlreadyRetrieved: false,
            });
            return;
          }
        }
        console.log(err);
      });
  }

  upperCaseTableName() {
    return convertTableNameParam(this.props.match.params.tableName);
  }

  lowerCaseTableName() {
    return this.upperCaseTableName().toLowerCase();
  }

  insertRow() {
    const newItem = {};
    const inputs = document.getElementsByClassName('new-item-input');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (input.value) {
        const name = input.getAttribute('placeholder');
        newItem[name] = input.value;
        input.value = '';
      }
    }
    axios.post('/tables/' + this.lowerCaseTableName(), newItem)
      .then(res => {
        this.setState(prevState => {
          const newRows = prevState.rows;
          newRows.push(newItem);
          return { rows: newRows };
        });
        this.props.logQuery(res.data.query);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            return;
          }
        }
        console.log(err);
      });
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
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.props.logQuery(query, error_message);
            return;
          }
        }
        console.log(err);
      });
  }

  render() {
    const tableInfo = this.state.tableInfoSaved;
    let html = (
      <div style={{ textAlign: 'center' }}>
        {this.upperCaseTableName()} table does not exist.
      </div>
    )
    if (tableInfo && this.state.rows) {
      const items = (
        this.state.rows.map((r, i) => {
          return (
            <tr key={i}>
              {tableInfo.columns.map((c, i) => {
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
        <div>
          <h1 className="pb-4">{this.upperCaseTableName()}</h1>

          <table className="table table-responsive-lg table-hover">
            <thead>
              <tr>
                {tableInfo.columns.map((c, i) => (
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
          <button
            type="button"
            className="btn btn-success"
            style={{
              marginTop: '10px',
              marginBottom: '20px',
            }}
            data-toggle="modal"
            data-target="#newItemModal"
          >
            <i className="fas fa-plus" style={{
              fontSize: '13px',
              position: 'relative',
              bottom: '1px',
              paddingRight: '6px',
            }}></i>
            New Item
          </button>
          <div className="modal fade" id="newItemModal" tabIndex="-1" role="dialog" aria-labelledby="newItemModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="newItemModalLabel">
                    New {singularizeTableName(this.props.match.params.tableName)}
                  </h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    {tableInfo.columns.map((c, i) => (
                      <div className="form-group" key={i}>
                        <input
                          type="text"
                          className="form-control new-item-input"
                          id={c.column_name + '-input'}
                          placeholder={c.column_name}
                          style={{ color: '#000' }}
                        />
                      </div>
                    ))}
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.insertRow}>
                    Insert Row
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', position: 'relative' }}>
        <div className="refresh-button" onClick={this.getSetRows}>
          <i className="fas fa-sync-alt"></i>
        </div>
        {html}
      </div>
    );
  }
}

const convertTableNameParam = tableName => {
  let parts = tableName.split('-');
  parts = parts.map(str => str.charAt(0).toUpperCase() + str.slice(1));
  return parts.join('');
}

const singularizeTableName = tableName => {
  let parts = tableName.split('-');
  const newLastPart = pluralize.singular(parts[parts.length - 1]);
  parts[parts.length - 1] = newLastPart;
  return convertTableNameParam(parts.join('-'));
}

DataTable.propTypes = {
  tablesInfo: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
  logQuery: PropTypes.func.isRequired,
}

export default DataTable;
