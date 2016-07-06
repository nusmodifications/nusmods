import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class UsersContainer extends Component {
  constructor(props, ctx) {
    super(props);
    this.state = {
      users: [
        {
          name: 'John Doe',
          id: 1
        },
        {
          name: 'Mary Jane',
          id: 2
        }
      ]
    };
  }

  render() {
    return (
      <div>
        <h1>Users</h1>
        <div className="users-page">
          <ul>
            {this.state.users.map(user => (
              <li key={user.id}>
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="users-detail">
          {this.props.children}
        </div>
      </div>
    );
  }
}
