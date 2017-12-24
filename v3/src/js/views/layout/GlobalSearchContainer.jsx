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

  getResults = (inputValue: string) => {
    if (!inputValue) {
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
    return matchBreakpoint && <GlobalSearch getResults={this.getResults} />;
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  moduleList: state.moduleBank.moduleList,
  venueList: state.venueBank.venueList,
});
const connectedSearchContainer = connect(mapStateToProps, { fetchVenueList })(SearchContainerComponent);
export default makeResponsive(connectedSearchContainer, 'md');
