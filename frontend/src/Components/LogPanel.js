import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LogPanel extends Component {
  constructor(props) {
    super(props);
  }

  onClickArrow() {

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
          justifyContent: 'flex-end',
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
        }}>
          <p style={{
            color: 'white',
            padding: '10px 15px',
            fontFamily: 'monospace',
          }}>
            CREATE TABLE VehicleTypes (
              vtname VARCHAR (40),
              features TEXT,
              wrate MONEY,
              drate MONEY,
              hrate MONEY,
              wirate MONEY,
              dirate MONEY,
              hirate MONEY,
              krate MONEY,
              PRIMARY KEY (vtname)
            );
          </p>
        </div>
      </div>
    );
  }
}

LogPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClickArrow: PropTypes.func.isRequired,
}

export default LogPanel;
