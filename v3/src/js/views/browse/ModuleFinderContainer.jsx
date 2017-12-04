// @flow
import type { ContextRouter } from 'react-router-dom';

import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import update from 'immutability-helper';
import qs from 'query-string';
import Raven from 'raven-js';
import _ from 'lodash';

import type { Module } from 'types/modules';
import type { PageRange, PageRangeDiff } from 'types/views';
import type { FilterGroupId } from 'utils/filters/FilterGroup';

import ModuleFinderList from 'views/browse/ModuleFinderList';
import ModuleSearchBox from 'views/browse/ModuleSearchBox';
import ChecklistFilters from 'views/components/filters/ChecklistFilters';
import TimeslotFilters from 'views/components/filters/TimeslotFilters';
import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';

import moduleFilters, {
  LEVELS,
  LECTURE_TIMESLOTS,
  TUTORIAL_TIMESLOTS,
  MODULE_CREDITS,
} from 'views/browse/module-filters';
import { createSearchFilter, sortModules, SEARCH_QUERY_KEY } from 'views/browse/module-search';
import config from 'config';
import nusmods from 'apis/nusmods';
import { resetModuleFinder } from 'actions/module-finder';
import FilterGroup from 'utils/filters/FilterGroup';
import HistoryDebouncer from 'utils/HistoryDebouncer';
import { defer, breakpointUp } from 'utils/react';

type Props = {
  searchTerm: string,
  resetModuleFinder: () => any,
  ...ContextRouter,
};

type State = {
  loading: boolean,
  page: PageRange,
  modules: Module[],
  filterGroups: { [FilterGroupId]: FilterGroup<any> },
  error?: any,
};

// Threshold to enable instant search based on the amount of time it takes
// to run the filters on initial render. This is only an estimate since only
// ~50% of the time is spent on filters (the other 50% on rendering), so
// err on using a lower threshold
const INSTANT_SEARCH_THRESHOLD = 150;

const pageHead = (
  <Helmet>
    <title>Modules - {config.brandName}</title>
  </Helmet>
);

export function mergePageRange(prev: PageRange, diff: PageRangeDiff): PageRange {
  const next = _.clone(prev);

  // Current page is SET from the diff object
  if (diff.current != null) {
    next.current = diff.current;
  }

  // Start and pages are ADDED from the diff object
  ['start', 'loaded'].forEach((key) => {
    if (diff[key] != null) {
      next[key] += diff[key];
    }
  });

  return next;
}

export class ModuleFinderContainerComponent extends Component<Props, State> {
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

    this.state = {
      filterGroups,
      page: this.startingPageRange(),
      loading: true,
      modules: [],
    };
  }

  componentWillMount() {
    // Initialize search query. This is done here instead of in ModuleSearchBox because doing
    // the latter is too slow, and results in a flash of unfiltered results
    const params = qs.parse(this.props.location.search);
    if (params[SEARCH_QUERY_KEY]) this.onSearch(params[SEARCH_QUERY_KEY]);
  }

  componentDidMount() {
    axios.get(nusmods.modulesUrl())
      .then(({ data }) => {
        const params = qs.parse(this.props.location.search);
        const start = window.performance.now();
        this.filterGroups().forEach(group => group.initFilters(data));
        const time = window.performance.now() - start;

        if ('instant' in params) {
          this.useInstantSearch = params.instant === '1';
        } else {
          this.useInstantSearch = breakpointUp('md').matches && (time < INSTANT_SEARCH_THRESHOLD);
        }

        console.info(`${time}ms taken to init filters`); // eslint-disable-line
        console.info(this.useInstantSearch ? 'Instant search on' : 'Instant search off'); // eslint-disable-line

        this.setState({
          modules: data,
          loading: false,
        });
      })
      .catch((error) => {
        Raven.captureException(error);
        this.setState({ error });
      });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.searchTerm !== nextProps.searchTerm) {
      this.onSearch(nextProps.searchTerm);
    }
  }

  componentWillUnmount() {
    this.props.resetModuleFinder();
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
      this.setState(state => update(state, {
        filterGroups: updater,
      }));
    }
  }

  onFilterChange = (newGroup: FilterGroup<*>, resetScroll: boolean = true) => {
    this.setState(state => update(state, {
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
        ...this.props.history.location,
        search: qs.stringify(query),
      });

      // Scroll back to the top
      if (resetScroll) window.scrollTo(0, 0);
    });
  };

  onPageChange = (diff: PageRangeDiff) => {
    this.setState(prevState => ({
      page: mergePageRange(prevState.page, diff),
    }), this.updatePageHash);
  };

  onSearch(searchTerm: string) {
    const filter = createSearchFilter(searchTerm)
      .initFilters(this.state.modules);

    defer(() => {
      this.onFilterChange(filter, false);
    });
  }

  useInstantSearch = false;

  updatePageHash = () => {
    // Update the location hash so that users can share the URL and go back to the
    // correct page when the going back in history
    const { current } = this.state.page;
    this.history.push({
      ...this.props.history.location,
      hash: current ? `page=${current}` : '',
    });
  };

  // Getters and helper functions
  filterGroups(): FilterGroup<any>[] {
    return _.values(this.state.filterGroups);
  }

  startingPageRange(): PageRange {
    const hashMatch = this.props.location.hash.match(/page=(\d+)/);
    const start = hashMatch ? parseInt(hashMatch[1], 10) : 0;

    return {
      start,
      current: start,
      loaded: 1,
    };
  }

  render() {
    const { filterGroups: groups, modules, loading, page, error } = this.state;

    if (error) {
      return <ErrorPage error="cannot load modules info" eventId={Raven.lastEventId()} />;
    }

    if (loading) {
      return (
        <div>
          {pageHead}
          <LoadingSpinner />
        </div>
      );
    }

    // Set up filter groups
    let filteredModules = FilterGroup.apply(modules, this.filterGroups());
    if (this.props.searchTerm) {
      filteredModules = sortModules(this.props.searchTerm, filteredModules);
    }

    return (
      <div className="modules-page-container page-container">
        {pageHead}

        <div className="row">
          <div className="col-md-8 col-lg-9">
            <h1 className="sr-only">Module Finder</h1>

            <ModuleSearchBox useInstantSearch={this.useInstantSearch} />

            <ModuleFinderList
              modules={filteredModules}
              page={page}
              onPageChange={this.onPageChange}
            />
          </div>

          <div className="col-md-4 col-lg-3">
            <div className="module-filters">
              <header>
                <h3>Refine by</h3>
              </header>

              <ChecklistFilters
                group={groups[LEVELS]}
                groups={this.filterGroups()}
                onFilterChange={this.onFilterChange}
              />

              <ChecklistFilters
                group={groups[MODULE_CREDITS]}
                groups={this.filterGroups()}
                onFilterChange={this.onFilterChange}
              />

              <TimeslotFilters
                group={groups[LECTURE_TIMESLOTS]}
                groups={this.filterGroups()}
                onFilterChange={this.onFilterChange}
              />

              <TimeslotFilters
                group={groups[TUTORIAL_TIMESLOTS]}
                groups={this.filterGroups()}
                onFilterChange={this.onFilterChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  searchTerm: state.moduleFinder.search.term,
});

export default connect(mapStateToProps, { resetModuleFinder })(
  withRouter(ModuleFinderContainerComponent),
);
