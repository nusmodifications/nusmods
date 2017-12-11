// @flow
import type { ContextRouter } from 'react-router-dom';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import qs from 'query-string';

import SearchBox from 'views/components/SearchBox';
import { searchModules } from 'actions/module-finder';
import { SEARCH_QUERY_KEY } from './module-search';

type Props = ContextRouter & {
  throttle: number,
  useInstantSearch: boolean,
  initialSearchTerm: ?string,

  searchModules: (string) => void,
};

export function ModuleSearchBoxComponent(props: Props) {
  return (
    <SearchBox
      throttle={props.throttle}
      useInstantSearch={props.useInstantSearch}
      initialSearchTerm={props.initialSearchTerm}
      placeholder="Module code, names and descriptions"
      onSearch={props.searchModules}
    />
  );
}

ModuleSearchBoxComponent.defaultProps = {
  useInstantSearch: false,
  throttle: 300,
};

export default withRouter(
  connect(
    (state, ownProps) => ({
      searchDescription: state.moduleFinder.search.searchDescription,
      initialSearchTerm: qs.parse(ownProps.location.search)[SEARCH_QUERY_KEY],
    }),
    { searchModules },
  )(ModuleSearchBoxComponent),
);
