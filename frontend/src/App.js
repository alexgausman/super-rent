import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

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
    };

    this.onClickLogPanelArrow = this.onClickLogPanelArrow.bind(this);
  }

  onClickLogPanelArrow() {
    this.setState(prevState => ({
      logPanelIsOpen: !prevState.logPanelIsOpen,
    }))
  }

  render() {
    const { logPanelIsOpen } = this.state;
    return (
      <BrowserRouter>
        <div className="App">
          <TopNav />
          <div className="container-fluid">
            <div className="row">
              <SideNav />
              <div style={{
                position: 'relative',
                width: 'calc(100vw - 240px)',
              }}>
                <div style={{
                  width: '100%',
                  height: `calc(100vh - ${logPanelIsOpen ? 336 : 96}px)`,
                  overflowY: 'scroll',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Route exact path="/" component={Dashboard} />
                  <Route path="/tables/:tableName" component={DataTable} />
                </div>
                <LogPanel
                  isOpen={this.state.logPanelIsOpen}
                  onClickArrow={this.onClickLogPanelArrow}
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
