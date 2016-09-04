import React, { PropTypes } from 'react';

const UserSection = (props) => (
  <div>
    <p>User Id Selected: {props.params.userId}</p>
  </div>
);

UserSection.propTypes = {
  params: PropTypes.object,
};

export default UserSection;
