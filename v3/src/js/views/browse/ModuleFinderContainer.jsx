import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { modulePagePath } from 'utils/modules';

function ModuleFinderContainer(props) {
  return (
    <div>
      <h1 className="display-4">Module Finder</h1>
      <hr/>
      <p>WIP. Only 30 shown for brevity.</p>
      <hr/>
      {props.moduleList.slice(0, 30).map((module) => {
        return (
          <div key={module.ModuleCode}>
            <Link to={modulePagePath(module.ModuleCode)}>
              {module.ModuleCode} {module.ModuleTitle}
            </Link>
            <hr/>
          </div>
        );
      })}
    </div>
  );
}

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
