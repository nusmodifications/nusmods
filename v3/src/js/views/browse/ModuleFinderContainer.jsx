// @flow
import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import update from 'immutability-helper';

import type { Module } from 'types/modules';

import ModuleFinderList from 'views/browse/ModuleFinderList';
import ChecklistFilters from 'views/components/filters/ChecklistFilters';
import LoadingSpinner from 'views/LoadingSpinner';

import {
  levels,
  moduleCredits,
  tutorialTimeslots,
  lectureTimeslots,
} from 'views/browse/module-filters';

import config from 'config';
import nusmods from 'apis/nusmods';
import FilterGroup from 'utils/filters/FilterGroup';

class ModuleFinderContainer extends Component {
  state: {
    loading: boolean,
    modules: Array<Module>,
    filterGroups: { [string]: FilterGroup<any> },
  } = {
    loading: true,
    modules: [],
    filterGroups: {
      levels,
      moduleCredits,
      tutorialTimeslots,
      lectureTimeslots,
    },
  };

  componentDidMount() {
    axios.get(nusmods.modulesUrl())
      .then(({ data }) => {
        this.setState({
          modules: data,
          loading: false,
        });
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
    const { filterGroups, modules, loading } = this.state;

    return (
      <DocumentTitle title={`Modules - ${config.brandName}`}>
        <div className="modules-page-container page-container">
          <h1 className="page-title">Module Finder</h1>
          <div className="row">
            <div className="col-md-9">
              {loading ?
                <LoadingSpinner />
                :
                <ModuleFinderList
                  filterGroups={Object.values(filterGroups)}
                  modules={modules}
                />
              }
            </div>

            <div className="col-md-3">
              <div className="module-filters">
                <h3>Search Options</h3>
                {Object.entries(filterGroups).map(([key, group]) => {
                  return (<ChecklistFilters
                    key={key}
                    group={group}
                    modules={modules}
                    onFilterChange={this.onFilterToggle(key)}
                  />);
                })}
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default withRouter(ModuleFinderContainer);
