import React, { Component } from 'react';

import TopNav from './Components/TopNav';
import SideNav from './Components/SideNav';
import LogPanel from './Components/LogPanel';

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
    return (
      <div className="App">
        <TopNav />
        <div className="container-fluid">
          <div className="row">
            <SideNav />
            <div>
              <LogPanel
                isOpen={this.state.logPanelIsOpen}
                onClickArrow={this.onClickLogPanelArrow}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
