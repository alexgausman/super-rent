import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LogPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unreadErrors: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    let newUnreadErrors = prevState.unreadErrors;
    if (this.props.isOpen) {
      newUnreadErrors = false;
    } else {
      const prevQueriesLength = prevProps.queries.length;
      if (this.props.queries.length > prevQueriesLength) {
        this.props.queries.forEach((q, i) => {
          if ((i + 1 > prevQueriesLength) && q.error) {
            newUnreadErrors = true;
          }
        });
      }
    }
    if (newUnreadErrors !== prevState.unreadErrors) {
      this.setState({ unreadErrors: newUnreadErrors });
    }
  }

  render() {
    const { isOpen } = this.props;
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        width: 'calc(100vw - 240px)',
      }}>
        <div style={{
          height: '40px',
          width: '100%',

          backgroundColor: 'rgba(0,0,0,0.75)',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          <div onClick={this.props.onClickArrow} style={{
            float: 'right',
            marginRight: '8px',
            color: 'white',
            fontSize: '29px',
            cursor: 'pointer',
          }}>
            <i className={`fas fa-angle-${isOpen ? 'down' : 'up'}`} style={{
              lineHeight: 0.8,
              backgroundColor: (this.state.unreadErrors ? 'red' : ''),
              padding: '3px 5px',
              borderRadius: '50%',
            }}></i>
          </div>
        </div>
        <div id="inner-log-panel" style={{
          height: '240px',
          width: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: (isOpen ? 'block' : 'none'),
          overflowY: 'scroll',
        }}>
          {this.props.queries.map((queryObj, i) => {
            const { query, error } = queryObj;
            return (
              <div className="log-block" key={i} style={{
                color: 'white',
                margin: '10px 15px',
                fontFamily: 'monospace',
              }}>
                {query.split('\n\n').map((s,i) => (
                  <p key={i}>{s}</p>
                ))}
                {error && <p className="text-danger">Error: {error}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

LogPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClickArrow: PropTypes.func.isRequired,
  queries: PropTypes.array.isRequired,
}

export default LogPanel;
