import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import axios from 'axios';

import TopNav from './Components/TopNav';
import SideNav from './Components/SideNav';
import LogPanel from './Components/LogPanel';

import Dashboard from './Components/Dashboard';
import DataTable from './Components/DataTable';

class App extends Component {
  constructor() {
    super();
    this.state = {
      logPanelIsOpen: false,
      tables: [],
      queries: [],
    };

    this.getSetTablesInfo = this.getSetTablesInfo.bind(this);
    this.getSetTableColumns = this.getSetTableColumns.bind(this);
    this.getSetTableRowCount = this.getSetTableRowCount.bind(this);
    this.logQuery = this.logQuery.bind(this);
    this.dbHasTables = this.dbHasTables.bind(this);
    this.initTables = this.initTables.bind(this);
    this.seedTables = this.seedTables.bind(this);
    this.destroyTables = this.destroyTables.bind(this);
    this.onClickLogPanelArrow = this.onClickLogPanelArrow.bind(this);
  }

  componentDidMount() {
    this.getSetTablesInfo();
  }

  getSetTablesInfo() {
    this.setState({ loading: true}, () => {
      axios.get('/admin/db-tables-list')
        .then(res => {
          const tables = [];
          res.data.forEach(d => tables.push({ name: d.table_name }));
          this.setState({tables: tables}, () => {
            this.state.tables.forEach(t => {
              this.getSetTableColumns(t.name);
              this.getSetTableRowCount(t.name);
            })
          });
        })
        .catch(err => console.log(err));
    })
  }

  getSetTableColumns(tableName) {
    axios.get('/admin/db-table-columns/' + tableName)
      .then(res => {
        this.setState(prevState => {
          let tables = prevState.tables;
          tables = tables.map(t => {
            if (t.name === tableName) {
              t.columns = res.data;
              return t;
            }
          });
          return { tables: tables };
        });
      })
      .catch(err => console.log(err));
  }

  getSetTableRowCount(tableName) {
    axios.get('/admin/db-table-row-count/' + tableName)
      .then(res => {
        this.setState(prevState => {
          let tables = prevState.tables;
          tables = tables.map(t => {
            if (t.name === tableName) {
              t.rowCount = parseInt(res.data.rows[0].count);
              return t;
            }
          });
          return { tables: tables };
        });
      })
      .catch(err => console.log(err));
  }

  dbHasTables() {
    return (this.state.tables.length > 0);
  }

  onClickLogPanelArrow() {
    this.setState(prevState => ({
      logPanelIsOpen: !prevState.logPanelIsOpen,
    }), () => this.scrollLogsToBottom());
  }

  logQuery(q, err) {
    this.setState(prevState => {
      const queries = prevState.queries.map(q => q);
      const newQuery = { query: q }
      if (err) {
        newQuery.error = err;
      }
      queries.push(newQuery);
      return { queries: queries };
    }, () => this.scrollLogsToBottom());
  }

  scrollLogsToBottom() {
    const panel = document.getElementById('inner-log-panel');
    panel.scrollTop = panel.scrollHeight;
  }

  initTables() {
    axios.post('/admin/init-db')
      .then(res => {
        this.logQuery(res.data.query);
        this.getSetTablesInfo();
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.logQuery(query, error_message);
            return;
          }
        }
        console.log(err);
      });
  }

  seedTables() {
    axios.post('/admin/seed-db')
      .then(res => {
        this.logQuery(res.data.query);
        this.getSetTablesInfo();
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const { query, error_message } = err.response.data;
          if (query && error_message) {
            this.logQuery(query, error_message);
            return;
          }
        }
        console.log(err);
      });
  }

  destroyTables() {
    axios.post('/admin/clear-db')
      .then(res => {
        this.setState({
          tables: [],
          queries: [],
        }, () => this.getSetTablesInfo());
      })
      .catch(err => console.log(err));
  }

  render() {
    const { tables, queries, logPanelIsOpen } = this.state;
    return (
      <BrowserRouter>
        <div className="App">
          <TopNav
            dbHasTables={this.dbHasTables()}
            initTables={this.initTables}
            seedTables={this.seedTables}
            destroyTables={this.destroyTables}
          />
          <div className="container-fluid">
            <div className="row">
              <Route
                path="/"
                render={props => (
                  <SideNav match={props.match} />
                )}
              />
              <div style={{
                position: 'relative',
                width: 'calc(100vw - 240px)',
              }}>
                <div style={{
                  width: '100%',
                  height: `calc(100vh - ${logPanelIsOpen ? 336 : 96}px)`,
                  overflowY: 'scroll',
                  display: 'flex',
                  justifyContent: 'center',
                  // alignItems: 'center',
                  padding: '40px',
                }}>
                  <Route exact path="/" >
                    <Dashboard
                      updateDbStats={this.getSetTablesInfo}
                      tables={tables}
                      queries={queries}
                    />
                  </Route>
                  <Route
                    path="/tables/:tableName"
                    render={props => (
                      <DataTable
                        tablesInfo={tables}
                        match={props.match}
                        logQuery={this.logQuery}
                      />
                    )}
                  />
                  <Route path="/customer-actions/:action">
                    <span>TODO</span>
                  </Route>
                  <Route path="/clerk-actions/:action">
                    <span>TODO</span>
                  </Route>
                </div>
                <LogPanel
                  isOpen={this.state.logPanelIsOpen}
                  onClickArrow={this.onClickLogPanelArrow}
                  queries={this.state.queries}
                />
              </div>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
