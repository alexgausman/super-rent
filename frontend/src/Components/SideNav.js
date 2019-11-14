import React from 'react';
import { Link } from 'react-router-dom';

function SideNav(props) {
  return (
    <nav className="col-md-2 d-none d-md-block bg-light sidebar" style={{
      height: 'calc(100vh - 56px)',
      width: '240px',
      overflowY: 'scroll',
      maxWidth: 'none',
      flex: 'none',
    }}>
      <div className="sidebar-sticky" style={{ marginTop: '44px' }}>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Tables</span>
        </h6>
        <ul className="nav flex-column mb-2">
          {[
            { text: 'Branches', link: '/tables/branches'},
            { text: 'Customers', link: '/tables/customers'},
            { text: 'Vehicles', link: '/tables/vehicles'},
            { text: 'Reservations', link: '/tables/reservations'},
            { text: 'Rentals', link: '/tables/rentals'},
            { text: 'Returns', link: '/tables/returns'},
            { text: 'VehicleTypes', link: '/tables/vehicle-types'},
          ].map((item, index) => {
            const isActive = window.location.href.includes(item.link);
            return (
              <li className={`nav-item ${isActive && 'active'}`} key={index}>
                <Link className="nav-link pb-1 pt-0" to={item.link}>
                  {item.text}
                </Link>
              </li>
            );
          })}
        </ul>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Customer Actions</span>
        </h6>
        <ul className="nav flex-column mb-2">
          {[
            { text: 'View Available Vehicles', link: '/customer-actions/view-available-vehicles' },
            { text: 'Make a Reservation', link: '/customer-actions/make-a-reservation'},
          ].map((item, index) => {
            const isActive = window.location.href.includes(item.link);
            return (
              <li className={`nav-item ${isActive && 'active'}`} key={index}>
                <Link className="nav-link pb-1 pt-0" to={item.link}>
                  {item.text}
                </Link>
              </li>
            );
          })}
        </ul>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Clerk Actions</span>
        </h6>
        <ul className="nav flex-column mb-2">
          {[
            { text: 'Rent Vehicle', link: '/clerk-actions/rent-vehicle' },
            { text: 'Return Vehicle', link: '/clerk-actions/return-vehicle'},
            { text: 'Generate Report', link: '/clerk-actions/generate-report'},
          ].map((item, index) => {
            const isActive = window.location.href.includes(item.link);
            return (
              <li className={`nav-item ${isActive && 'active'}`} key={index}>
                <Link className="nav-link pb-1 pt-0" to={item.link}>
                  {item.text}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default SideNav;
