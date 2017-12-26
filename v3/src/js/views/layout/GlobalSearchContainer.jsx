// @flow
import type { State } from 'reducers';
import type { MapStateToProps } from 'react-redux';
import type { ContextRouter } from 'react-router-dom';
import type { Module } from 'types/modules';
import type { Venue } from 'types/venues';
import type { ModuleList, VenueList } from 'types/reducers';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import GlobalSearch from 'views/layout/GlobalSearch';
import { modulePage, venuePage } from 'views/routes/paths';

import { fetchVenueList } from 'actions/venueBank';
import { regexify, createSearchPredicate, sortModules } from 'utils/moduleSearch';
import { breakpointUp } from 'utils/css';
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
    const path = typeof item === 'string' ? venuePage(item) : modulePage(item.ModuleCode, item.ModuleTitle);
    this.props.history.push(path);
  };

  getResults = (inputValue: string) => {
    if (!inputValue || inputValue.length < MIN_INPUT_LENGTH) {
      return [[], []];
    }
    const { moduleList, venueList } = this.props;

    // Filter venues
    const regex = regexify(inputValue);
    const venues = [];
    venueList.forEach((venue) => {
      if (venues.length >= RESULTS_LIMIT) {
        return;
      }
      if (regex.test(venue)) {
        venues.push(venue);
      }
    });
    const predicate = createSearchPredicate(inputValue);
    const filteredModules = [];
    moduleList.forEach((module) => {
      if (filteredModules.length >= RESULTS_LIMIT) {
        return;
      }
      if (predicate({ ...module })) {
        filteredModules.push(module);
      }
    });
    const modules = sortModules(inputValue, filteredModules.slice());

    // Plentiful of modules and venues, show 4 modules, 3 venues
    if (modules.length >= 4 && venues.length >= 3) {
      return [modules.slice(0, 4), venues.slice(0, 3)];
      // Some venues, show as many of them as possible as they are rare
    } else if (venues.length > 0) {
      return [modules.slice(0, RESULTS_LIMIT - venues.length), venues];
    }
    return [modules.slice(0, RESULTS_LIMIT), []];
  };

  render() {
    const { matchBreakpoint } = this.props;
    return matchBreakpoint && <GlobalSearch getResults={this.getResults} onChange={this.onChange} />;
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  moduleList: state.moduleBank.moduleList,
  venueList: state.venueBank.venueList,
});
const routedSearchContainer = withRouter(SearchContainerComponent);
const connectedSearchContainer = connect(mapStateToProps, { fetchVenueList })(routedSearchContainer);
export default makeResponsive(connectedSearchContainer, breakpointUp('md'));
