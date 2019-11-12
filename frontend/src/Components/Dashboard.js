import React from 'react';
import PropTypes from 'prop-types';

import DashboardCard from './DashboardCard';

function Dashboard(props) {
  const { tables, queries } = props;
  const tuplesCount = tables.reduce((acc, t) => acc + (t.rowCount || 0), 0 );
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div>
        <DashboardCard title="Tables" value={tables.length} />
        <DashboardCard title="Tuples" value={tuplesCount} />
      </div>
      <div>
        <DashboardCard title="Queries" value={queries.length} />
        <DashboardCard color="#CC0000" title="Errors" />
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  loading: PropTypes.bool.isRequired,
  tables: PropTypes.array.isRequired,
  queries: PropTypes.array.isRequired,
}

export default Dashboard;
