import React from 'react';
import { Link } from 'react-router-dom';

function TopNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <Link className="navbar-brand px-2" to="/">
        <i className="fas fa-car-side pr-2"></i>
        SuperRent
      </Link>
        <ul className="navbar-nav ml-auto">
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i className="fas fa-database"></i>
            </a>
            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown" style={{position: 'absolute'}}>
              <a className="dropdown-item" href="#">Initialize</a>
              <a className="dropdown-item disabled" href="#">Seed</a>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item text-danger" href="#">Destroy</a>
            </div>
          </li>
        </ul>
    </nav>
  );
}

export default TopNav;
