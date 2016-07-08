import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class AppContainer extends Component {
  render() {
    return (
      <div className="app-container">
        <div className="container">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul>
          <hr/>
          {this.props.children}
        </div>
      </div>
    );
  }
}
