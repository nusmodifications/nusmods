// @flow
import type { State } from 'reducers';
import type { ModuleCondensed } from 'types/modules';
import type { Venue, VenueList } from 'types/venues';
import type { ModuleList } from 'types/reducers';
import { type ResultType, type SearchResult, VENUE_RESULT } from 'types/views';

import React, { Component } from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { withRouter, type ContextRouter } from 'react-router-dom';
import GlobalSearch from 'views/layout/GlobalSearch';
import { modulePage, venuePage } from 'views/routes/paths';

import { fetchVenueList } from 'actions/venueBank';
import { regexify, createSearchPredicate, sortModules, tokenize } from 'utils/moduleSearch';
import { breakpointUp } from 'utils/css';
import { takeUntil } from 'utils/array';
import makeResponsive from 'views/hocs/makeResponsive';

type Props = {
  ...ContextRouter,

  moduleList: ModuleList,
  venueList: VenueList,
  matchBreakpoint: boolean,

  fetchVenueList: () => void,
};

const RESULTS_LIMIT = 10;
const LONG_LIST_LIMIT = 70;
const MIN_INPUT_LENGTH = 2;

export class SearchContainerComponent extends Component<Props> {
  componentDidMount() {
    this.props.fetchVenueList();
  }

  shouldComponentUpdate(nextProps: Props) {
    return (
      this.props.matchBreakpoint !== nextProps.matchBreakpoint ||
      this.props.moduleList.length !== nextProps.moduleList.length ||
      this.props.venueList.length !== nextProps.venueList.length
    );
  }

  onSelectModule = (module: ModuleCondensed) => {
    this.props.history.push(modulePage(module.ModuleCode, module.ModuleTitle));
  };

  onSelectVenue = (venue: Venue) => {
    this.props.history.push(venuePage(venue));
  };

  onSearch = (type: ResultType, query: string) => {
    // TODO: Move this into a proper function
    const path = type === VENUE_RESULT ? '/venues' : '/modules';
    this.props.history.push(`${path}?q=${encodeURIComponent(query)}`);
  };

  getResults = (inputValue: string): ?SearchResult => {
    if (!inputValue || inputValue.length < MIN_INPUT_LENGTH) {
      return null;
    }

    const { moduleList, venueList } = this.props;
    const tokens = tokenize(inputValue);

    // Filter venues
    const regex = regexify(inputValue);
    const venues = takeUntil(venueList, LONG_LIST_LIMIT, (venue) => regex.test(venue));

    // Filter modules
    const predicate = createSearchPredicate(inputValue);
    const filteredModules = takeUntil(moduleList, LONG_LIST_LIMIT, (module) =>
      predicate({ ...module }),
    );
    const modules = sortModules(inputValue, filteredModules.slice());

    // There's only one type of result - use the long list format
    if (!modules.length || !venues.length) {
      return {
        modules: modules.slice(0, LONG_LIST_LIMIT),
        venues: venues.slice(0, LONG_LIST_LIMIT),
        tokens,
      };
    }

    // Plenty of modules and venues, show 6 modules, 4 venues
    if (modules.length >= 6 && venues.length >= 4) {
      return { modules: modules.slice(0, 6), venues: venues.slice(0, 4), tokens };
    }

    // Some venues, show as many of them as possible as they are rare
    return { modules: modules.slice(0, RESULTS_LIMIT - venues.length), venues, tokens };
  };

  render() {
    const { matchBreakpoint } = this.props;
    if (!matchBreakpoint) return null;
    return (
      <GlobalSearch
        getResults={this.getResults}
        onSelectModule={this.onSelectModule}
        onSelectVenue={this.onSelectVenue}
        onSearch={this.onSearch}
      />
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  moduleList: state.moduleBank.moduleList,
  venueList: state.venueBank.venueList,
});
const routedSearchContainer = withRouter(SearchContainerComponent);
const connectedSearchContainer = connect(mapStateToProps, { fetchVenueList })(
  routedSearchContainer,
);
export default makeResponsive(connectedSearchContainer, breakpointUp('md'));
