import React from 'react';
import { Link } from 'react-router-dom';

function SideNav() {
  return (
    <nav className="col-md-2 d-none d-md-block bg-light sidebar" style={{
      height: 'calc(100vh - 56px)',
      width: '240px',
      overflowY: 'scroll',
    }}>
      <div className="sidebar-sticky">
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Tables</span>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/tables/customers">
              Customers
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/tables/vehicles">
              Vehicles
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/tables/reservations">
              Reservations
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/tables/rentals">
              Rentals
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/tables/returns">
              Returns
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/tables/vehicle-types">
              VehicleTypes
            </Link>
          </li>
        </ul>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Customer Actions</span>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/customer-actions/view-available-vehicles">
              View Available Vehicles
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/customer-actions/make-a-reservation">
              Make a Reservation
            </Link>
          </li>
        </ul>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-2 text-muted">
          <span>Clerk Actions</span>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/clerk-actions/rent-vehicle">
              Rent Vehicle
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/clerk-actions/return-vehicle">
              Return Vehicle
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link pb-1 pt-0" to="/clerk-actions/generate-report">
              Generate Report
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SideNav;
