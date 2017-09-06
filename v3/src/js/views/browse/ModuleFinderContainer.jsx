// @flow
import type { ContextRouter } from 'react-router-dom';

import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import update from 'immutability-helper';
import _ from 'lodash';
import qs from 'query-string';

import type { Module } from 'types/modules';
import type { PageRange, PageRangeDiff } from 'types/views';
import type { FilterGroupId } from 'utils/filters/FilterGroup';

import ModuleFinderList from 'views/browse/ModuleFinderList';
import ChecklistFilters from 'views/components/filters/ChecklistFilters';
import TimeslotFilters from 'views/components/filters/TimeslotFilters';
import LoadingSpinner from 'views/LoadingSpinner';
import moduleFilters, {
  LEVELS,
  LECTURE_TIMESLOTS,
  TUTORIAL_TIMESLOTS,
  MODULE_CREDITS,
} from 'views/browse/module-filters';
import config from 'config';
import nusmods from 'apis/nusmods';
import FilterGroup from 'utils/filters/FilterGroup';
import HistoryDebouncer from 'utils/HistoryDebouncer';

type Props = ContextRouter;

type State = {
  loading: boolean,
  page: PageRange,
  modules: Module[],
  filterGroups: { [FilterGroupId]: FilterGroup<any> },
};

export function mergePageRange(prev: PageRange, diff: PageRangeDiff): PageRange {
  const next = _.clone(prev);

  // Current page is SET from the diff object
  if (diff.current != null) next.current = diff.current;

  // Start and pages are ADDED from the diff object
  ['start', 'pages'].forEach((key) => {
    if (diff[key] != null) next[key] += diff[key];
  });

  return next;
}

export class ModuleFinderContainerComponent extends Component<Props, State> {
  props: Props;
  state: State;

  history: HistoryDebouncer;
  unlisten: () => void;

  constructor(props: Props) {
    super(props);

    // Parse out query params from URL and use that to initialize filter groups
    const params = qs.parse(props.location.search);
    const filterGroups = _.mapValues(moduleFilters, (group: FilterGroup<*>) => {
      return group.fromQueryString(params[group.id]);
    });

    // Set up history debouncer and history listener
    this.history = new HistoryDebouncer(props.history);
    this.unlisten = props.history.listen(location => this.onQueryStringChange(location.search));

    const start = this.startingPage();

    this.state = {
      filterGroups,
      page: {
        start,
        current: start,
        pages: 1,
      },
      loading: true,
      modules: [],
    };
  }

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

  // Event handlers
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
      page: { $merge: { start: 0, current: 0 } },
    }), () => {
      // Update query string after state is updated
      const query = {};
      this.filterGroups().forEach((group) => {
        const value = group.toQueryString();
        if (!value) return;
        query[group.id] = value;
      });

      this.history.push({
        ...this.props.location,
        search: qs.stringify(query),
      });

      // Scroll back to the top
      window.scrollTo(0, 0);
    });
  };

  onPageChange = (diff: PageRangeDiff) => {
    this.setState(prevState => ({
      page: mergePageRange(prevState.page, diff),
    }), () => {
      // Update the location hash so that users can share the URL and go back to the
      // correct page when the going back in history
      const { current } = this.state.page;
      this.history.push({
        ...this.props.location,
        hash: current ? `page=${current}` : '',
      });
    });
  };

  // Getters and helper functions
  filterGroups(): FilterGroup<any>[] {
    return _.values(this.state.filterGroups);
  }

  startingPage(): number {
    const hashMatch = this.props.location.hash.match(/page=(\d+)/);
    return hashMatch ? parseInt(hashMatch[1], 10) : 0;
  }

  render() {
    const { filterGroups: groups, modules, loading, page } = this.state;
    const filteredModules = FilterGroup.apply(modules, this.filterGroups());

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
                  modules={filteredModules}
                  page={page}
                  onPageChange={this.onPageChange}
                />
              }
            </div>

            <div className="col-md-4 col-lg-3">
              <div className="module-filters">
                <header>
                  <h3>Refine by</h3>
                </header>

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
