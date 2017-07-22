// @flow
import React from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import ModuleFinderItem from 'views/components/ModuleFinderItem';

import config from 'config';
import type { ModuleCondensed } from 'types/modules';

function ModuleFinderContainer(props: { moduleList: Array<ModuleCondensed> }) {
  return (
    <DocumentTitle title={`Modules - ${config.brandName}`}>
      <div className="modules-page-container page-container">
        <h1 className="page-title">Module Finder</h1>
        <ul className="modules-list">
          {props.moduleList.slice(0, 30).map((module) => {
            return <ModuleFinderItem module={module} />;
          })}
        </ul>
      </div>
    </DocumentTitle>
  );
}

function mapStateToProps(state) {
  return {
    moduleList: state.entities.moduleBank.moduleList,
  };
}

export default withRouter(connect(mapStateToProps)(ModuleFinderContainer));
