import React from 'react';

function SideNav() {
  return (
    <nav className="col-md-2 d-none d-md-block bg-light sidebar" style={{
      minHeight: 'calc(100vh - 56px)',
      minWidth: '240px',
    }}>
      <div className="sidebar-sticky">
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Tables</span>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Customers
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Vehicles
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Reservations
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Rentals
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Returns
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              VehicleTypes
            </a>
          </li>
        </ul>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Customer Actions</span>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              View Available Vehicles
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Make a Reservation
            </a>
          </li>
        </ul>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Clerk Actions</span>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Rent Vehicle
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Return Vehicle
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link pb-1 pt-0" href="#">
              Generate Report
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SideNav;
