// @flow
import React from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import update from 'immutability-helper';

import type { ModulesMap } from 'reducers/entities/moduleBank';
import { fetchAllModules } from 'actions/moduleBank';
import ModuleFinderItem from 'views/components/ModuleFinderItem';
import ChecklistFilters from 'views/components/filters/ChecklistFilters';
import {
  levels,
  moduleCredits,
  tutorialTimeslots,
  lectureTimeslots,
} from 'views/browse/module-filters';

import config from 'config';
import FilterGroup from 'utils/filters/FilterGroup';
import type { Module } from 'types/modules';

class ModuleFinderContainer extends React.Component {
  props: {
    fetchAllModules: () => Promise<Array<Module>>,
    modules: ModulesMap,
  };

  state = {
    loading: true,
    filterGroups: {
      levels,
      moduleCredits,
      tutorialTimeslots,
      lectureTimeslots,
    },
  };

  componentDidMount() {
    this.props.fetchAllModules()
      .then(() => {
        this.setState({ loading: false });
      });
  }

  onFilterToggle(key: string) {
    return (newCollection: FilterGroup<*>) => {
      this.setState(update(this.state, {
        filterGroups: { [key]: { $set: newCollection } },
      }));
    };
  }

  render() {
    const { filterGroups } = this.state;
    const moduleList = Object.values(this.props.modules);

    return (
      <DocumentTitle title={`Modules - ${config.brandName}`}>
        <div className="modules-page-container page-container">
          <div className="row">
            <div className="col-md-8">
              <h1 className="page-title">Module Finder</h1>
              <ul className="modules-list">
                {moduleList.slice(0, 30).map((module) => {
                  return <ModuleFinderItem module={module} />;
                })}
              </ul>
            </div>

            <div className="col-md-4">
              {Object.entries(filterGroups).map(([key, collection]) => {
                return (<ChecklistFilters
                  collection={collection}
                  modules={moduleList}
                  onFilterChange={this.onFilterToggle(key)}
                />);
              })}
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    modules: state.entities.moduleBank.modules,
  };
}

export default withRouter(connect(mapStateToProps, {
  fetchAllModules,
})(ModuleFinderContainer));
