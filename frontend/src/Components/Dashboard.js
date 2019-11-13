import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DashboardCard from './DashboardCard';

class Dashboard extends Component {
  componentDidMount() {
    this.props.updateDbStats();
  }

  render() {
    const { tables, queries } = this.props;
    const tuplesCount = tables.reduce((acc, t) => acc + (t.rowCount || 0), 0 );
    const errCount = queries.reduce((acc, q) => {
      return acc + (q.error_message ? 0: 1);
    }, 0);
    return (
      <div className="dashboard-container" style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <div>
          <DashboardCard title="Tables" value={tables.length} />
          <DashboardCard title="Tuples" value={tuplesCount} />
        </div>
        <div>
          <DashboardCard title="Queries" value={queries.length} />
          <DashboardCard color="#CC0000" title="Errors" value={errCount} />
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  updateDbStats: PropTypes.func.isRequired,
  tables: PropTypes.array.isRequired,
  queries: PropTypes.array.isRequired,
}

export default Dashboard;
