// @flow
import type { State } from 'reducers';
import type { Module } from 'types/modules';
import type { Venue } from 'types/venues';
import type { ModuleList, VenueList } from 'types/reducers';

import React, { Component } from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { withRouter, type ContextRouter } from 'react-router-dom';
import GlobalSearch from 'views/layout/GlobalSearch';
import { modulePage, venuePage } from 'views/routes/paths';

import { fetchVenueList } from 'actions/venueBank';
import { regexify, createSearchPredicate, sortModules } from 'utils/moduleSearch';
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

const RESULTS_LIMIT = 7;
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

  onChange = (item: Module | Venue) => {
    const path =
      typeof item === 'string' ? venuePage(item) : modulePage(item.ModuleCode, item.ModuleTitle);
    this.props.history.push(path);
  };

  getResults = (inputValue: string) => {
    if (!inputValue || inputValue.length < MIN_INPUT_LENGTH) {
      return [[], []];
    }
    const { moduleList, venueList } = this.props;

    // Filter venues
    const regex = regexify(inputValue);
    const venues = takeUntil(venueList, RESULTS_LIMIT, (venue) => regex.test(venue));

    // Filter modules
    const predicate = createSearchPredicate(inputValue);
    const filteredModules = takeUntil(moduleList, RESULTS_LIMIT, (module) =>
      predicate({ ...module }),
    );
    const modules = sortModules(inputValue, filteredModules.slice());

    // Plentiful of modules and venues, show 4 modules, 3 venues
    if (modules.length >= 4 && venues.length >= 3) {
      return [modules.slice(0, 4), venues.slice(0, 3)];
    }

    // Some venues, show as many of them as possible as they are rare
    return [modules.slice(0, RESULTS_LIMIT - venues.length), venues];
  };

  render() {
    const { matchBreakpoint } = this.props;
    return (
      matchBreakpoint && <GlobalSearch getResults={this.getResults} onChange={this.onChange} />
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
