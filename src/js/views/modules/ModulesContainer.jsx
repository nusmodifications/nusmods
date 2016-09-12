import React, { PropTypes } from 'react';

const ModulesContainer = (props) => {
  return (
    <div className="modules-container">
      {props.children}
    </div>
  );
};

ModulesContainer.propTypes = {
  children: PropTypes.object,
};

export default ModulesContainer;
