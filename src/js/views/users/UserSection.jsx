import React, { Component, PropTypes } from 'react';

export default class UserSection extends Component {
  render() {
    return (
      <div>
        <p>User Id Selected: {this.props.params.userId}</p>
      </div>
    )
  }
}
