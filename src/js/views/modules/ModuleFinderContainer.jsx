import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const ModuleFinderContainer = (props) => (
  <div>
    <h1>Module Finder</h1>
    <hr/>
    {props.moduleList.map((module) => {
      return (
        <div key={module.ModuleCode}>
          <p>{module.ModuleCode} {module.ModuleTitle}</p>
          <hr/>
        </div>
      );
    })}
  </div>
);

ModuleFinderContainer.propTypes = {
  moduleList: PropTypes.array,
};

function mapStateToProps(state) {
  return {
    moduleList: state.entities.moduleList,
  };
}

export default connect(
  mapStateToProps
)(ModuleFinderContainer);
