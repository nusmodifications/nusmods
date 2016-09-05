import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

const ModuleFinderContainer = (props) => (
  <div>
    <h1>Module Finder</h1>
    <hr/>
    <p>Only 30 shown for brevity.</p>
    {props.moduleList.slice(0, 30).map((module) => {
      return (
        <div key={module.ModuleCode}>
          <Link to={{
            pathname: `/modules/${module.ModuleCode}`,
          }}>{module.ModuleCode} {module.ModuleTitle}</Link>
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
    moduleList: state.entities.moduleBank.moduleList,
  };
}

export default connect(
  mapStateToProps
)(ModuleFinderContainer);
