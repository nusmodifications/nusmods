// @flow
import type { Location, RouterHistory } from 'react-router-dom';

import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import update from 'immutability-helper';
import _ from 'lodash';
import qs from 'query-string';

import type { Module } from 'types/modules';
import type { FilterGroupId } from 'utils/filters/FilterGroup';

import ModuleFinderList from 'views/browse/ModuleFinderList';
import ChecklistFilters from 'views/components/filters/ChecklistFilters';
import TimeslotFilters from 'views/components/filters/TimeslotFilters';
import LoadingSpinner from 'views/LoadingSpinner';
import filterGroups, {
  LEVELS,
  LECTURE_TIMESLOTS,
  TUTORIAL_TIMESLOTS,
  MODULE_CREDITS,
} from 'views/browse/module-filters';
import config from 'config';
import nusmods from 'apis/nusmods';
import FilterGroup from 'utils/filters/FilterGroup';
import HistoryDebouncer from 'utils/HistoryDebouncer';

type Props = {
  location: Location,
  history: RouterHistory,
};

class ModuleFinderContainer extends Component {
  props: Props;

  history: HistoryDebouncer;

  constructor(props: Props) {
    super(props);

    // Parse out query params from URL and use that to initialize filter groups
    const params = qs.parse(props.location.search);
    this.history = new HistoryDebouncer(props.history);
    this.state.filterGroups = _.mapValues(filterGroups, (group: FilterGroup<*>) => {
      return group.fromQueryString(params[group.id]);
    });
  }

  state: {
    loading: boolean,
    modules: Array<Module>,
    filterGroups: { [FilterGroupId]: FilterGroup<any> },
  } = {
    loading: true,
    modules: [],
    filterGroups: {},
  };

  componentDidMount() {
    axios.get(nusmods.modulesUrl())
      // TODO: Handle error
      .then(({ data }) => {
        this.setState({
          modules: data,
          loading: false,
        });
      });
  }

  onFilterChange = (newGroup: FilterGroup<*>) => {
    this.setState(update(this.state, {
      filterGroups: { [newGroup.id]: { $set: newGroup } },
    }), () => {
      const { location } = this.props;
      const pairs = _.values(this.state.filterGroups)
        .map((group: FilterGroup<*>) => group.toQueryString())
        .filter(_.identity);
      const query = qs.stringify(_.fromPairs(pairs));

      this.history.push({
        pathname: location.pathname,
        search: `?${query}`,
      });
    });
  };

  render() {
    const { filterGroups: groups, modules, loading } = this.state;

    return (
      <DocumentTitle title={`Modules - ${config.brandName}`}>
        <div className="modules-page-container page-container">
          <h1 className="page-title">Module Finder</h1>
          <div className="row">
            <div className="col-md-8 col-lg-9">
              {loading ?
                <LoadingSpinner />
                :
                <ModuleFinderList
                  filterGroups={Object.values(groups)}
                  modules={modules}
                />
              }
            </div>

            <div className="col-md-4 col-lg-3">
              <div className="module-filters">
                <h3>Search Options</h3>

                <ChecklistFilters
                  group={groups[LEVELS]}
                  modules={modules}
                  onFilterChange={this.onFilterChange}
                />

                <ChecklistFilters
                  group={groups[MODULE_CREDITS]}
                  modules={modules}
                  onFilterChange={this.onFilterChange}
                />

                <TimeslotFilters
                  group={groups[LECTURE_TIMESLOTS]}
                  modules={modules}
                  onFilterChange={this.onFilterChange}
                />

                <TimeslotFilters
                  group={groups[TUTORIAL_TIMESLOTS]}
                  modules={modules}
                  onFilterChange={this.onFilterChange}
                />
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default withRouter(ModuleFinderContainer);
