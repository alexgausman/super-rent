import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LogPanel extends Component {
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
            marginRight: '13px',
            color: 'white',
            fontSize: '29px',
            cursor: 'pointer',
          }}>
            <i className={`fas fa-angle-${isOpen ? 'down' : 'up'}`}></i>
          </div>
        </div>
        <div style={{
          height: '240px',
          width: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: (isOpen ? 'block' : 'none'),
          overflowY: 'scroll',
        }}>
          {this.props.queries.map((q,i) => (
            <div key={i} style={{
              color: 'white',
              padding: '10px 15px',
              fontFamily: 'monospace',
            }}>
              {q.split('\n\n').map((s,i) => (
                <p key={i}>{s}</p>
              ))}
            </div>
          ))}
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
