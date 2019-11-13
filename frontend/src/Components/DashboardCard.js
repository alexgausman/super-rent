import React from 'react';
import PropTypes from 'prop-types';

function DashboardCard(props) {
  return (
    <div className="card" style={{
      display: 'inline-block',
      width: '14rem',
      margin: '1rem',
      borderColor: 'rgba(0,0,0,0.35)',
    }}>
      <div className="card-body" style={{
        padding: '0.75rem 1rem',
      }}>
        <h5 className="card-title" style={{
          fontSize: '24px',
          marginBottom: 0,
          color: 'rgba(0,0,0,0.65)',
        }}>{props.title}</h5>
        <p className="card-value" style={{
          float: 'right',
          fontSize: '30px',
          color: props.color,
        }}>{props.value}</p>
      </div>
    </div>
  );
}

DashboardCard.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.number,
};

DashboardCard.defaultProps = {
  color: '#007bff',
  title: 'Title',
  value: 0,
}

export default DashboardCard;
