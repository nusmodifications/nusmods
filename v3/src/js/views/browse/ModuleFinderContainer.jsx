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

export class ModuleFinderContainerComponent extends Component {
  props: Props;

  history: HistoryDebouncer;
  unlisten: () => void;

  constructor(props: Props) {
    super(props);

    // Parse out query params from URL and use that to initialize filter groups
    const params = qs.parse(props.location.search);
    this.state.filterGroups = _.mapValues(filterGroups, (group: FilterGroup<*>) => {
      return group.fromQueryString(params[group.id]);
    });

    // Set up history debouncer and history listener
    this.history = new HistoryDebouncer(props.history);
    this.unlisten = props.history.listen(location => this.onQueryStringChange(location.search));
  }

  state: {
    loading: boolean,
    modules: Module[],
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

  componentWillUnmount() {
    this.unlisten();
  }

  onQueryStringChange(query: string) {
    const params = qs.parse(query);
    const updater = {};
    this.filterGroups().forEach((group) => {
      const currentQuery = group.toQueryString();
      if (currentQuery === params[group.id] || (!params[group.id] && !currentQuery)) return;
      updater[group.id] = { $set: group.fromQueryString(params[group.id]) };
    });

    if (!_.isEmpty(updater)) {
      this.setState(update(this.state, {
        filterGroups: updater,
      }));
    }
  }

  onFilterChange = (newGroup: FilterGroup<*>) => {
    this.setState(update(this.state, {
      filterGroups: { [newGroup.id]: { $set: newGroup } },
    }), () => {
      // Update query string after state is updated
      const query = {};
      this.filterGroups().forEach((group) => {
        const value = group.toQueryString();
        if (!value) return;
        query[group.id] = value;
      });

      this.history.push({ search: qs.stringify(query) });
    });
  };

  filterGroups(): FilterGroup<any>[] {
    return _.values(this.state.filterGroups);
  }

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
                  filterGroups={_.values(groups)}
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

export default withRouter(ModuleFinderContainerComponent);
