// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { modulePagePath } from 'utils/modules';
import type { ModuleCondensed } from 'types/modules';

function ModuleFinderContainer(props: { moduleList: Array<ModuleCondensed> }) {
  return (
    <div>
      <h1 className="page-title">Module Finder</h1>
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

function mapStateToProps(state) {
  return {
    moduleList: state.entities.moduleBank.moduleList,
  };
}

export default connect(
  mapStateToProps
)(ModuleFinderContainer);
