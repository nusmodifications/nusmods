// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import GlobalSearch from 'views/layout/GlobalSearch';

import { fetchVenueList } from 'actions/venueBank';
import { regexify, createSearchPredicate, sortModules } from 'utils/moduleSearch';
import makeResponsive from 'views/hocs/makeResponsive';
import type { State } from 'reducers';
import type { MapStateToProps } from 'react-redux';
import type { ModuleList, VenueList } from 'types/reducers';

type Props = {
  moduleList: ModuleList,
  venueList: VenueList,
  matchBreakpoint: boolean,

  fetchVenueList: () => void,
};

const RESULTS_LIMIT = 7;

export class SearchComponent extends Component<Props> {
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

  getResults = (inputValue: string) => {
    if (!inputValue) {
      return [[], []];
    }
    const { moduleList, venueList } = this.props;

    // Filter venues
    const regex = regexify(inputValue);
    const venues = [];
    venueList.forEach((venue) => {
      if (venues.length > RESULTS_LIMIT) {
        return;
      }
      if (regex.test(venue)) {
        venues.push(venue);
      }
    });
    const predicate = createSearchPredicate(inputValue);
    const filteredModules = [];
    moduleList.forEach((module) => {
      if (filteredModules.length > RESULTS_LIMIT) {
        return;
      }
      if (predicate({ ...module })) {
        filteredModules.push(module);
      }
    });
    const modules = sortModules(inputValue, filteredModules.slice(0, RESULTS_LIMIT));

    // Plentiful of modules and venues, show 4 modules, 3 venues
    if (modules.length >= RESULTS_LIMIT && venues.length >= RESULTS_LIMIT) {
      return [modules.slice(0, 4), venues.slice(0, 3)];
      // Some venues, show as many of them as possible as they are rare
    } else if (venues.length > 0 && venues.length <= RESULTS_LIMIT) {
      return [modules.slice(0, venues.length), venues];
    } else if (modules.length >= RESULTS_LIMIT) {
      return [modules.slice(0, RESULTS_LIMIT), []];
    }
    return [modules, venues];
  };

  render() {
    const { matchBreakpoint } = this.props;
    return matchBreakpoint && <GlobalSearch getResults={this.getResults} />;
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  moduleList: state.moduleBank.moduleList,
  venueList: state.venueBank.venueList,
});
const connectedSearchComponent = connect(mapStateToProps, { fetchVenueList })(SearchComponent);
export default makeResponsive(connectedSearchComponent, 'md');
