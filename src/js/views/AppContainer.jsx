import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function AppContainer(props) {
  return (
    <div className="app-container">
      <div className="container">
        <nav className="navbar navbar-dark bg-primary">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/users">Users</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/counter">Counter</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reddit">Reddit</Link>
            </li>
          </ul>
        </nav>
        <br />
        {props.children}
      </div>
    </div>
  );
}

AppContainer.propTypes = {
  children: PropTypes.object,
};
