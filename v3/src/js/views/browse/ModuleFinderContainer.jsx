// @flow
import React from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import config from 'config';
import { modulePagePath } from 'utils/modules';
import type { ModuleCondensed } from 'types/modules';

function ModuleFinderContainer(props: { moduleList: Array<ModuleCondensed> }) {
  return (
    <div>
      <h1 className="page-title">Module Finder</h1>
      <hr />
      <p>WIP. Only 30 shown for brevity.</p>
      <hr />
      {props.moduleList.slice(0, 30).map((module) => {
        return (
          <DocumentTitle key={module.ModuleCode} title={`Modules - ${config.brandName}`}>
            <div className="modules-page-container page-container">
              <Link to={modulePagePath(module.ModuleCode)}>
                {module.ModuleCode} {module.ModuleTitle}
              </Link>
              <hr />
            </div>
          </DocumentTitle>
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

export default withRouter(connect(mapStateToProps)(ModuleFinderContainer));
