// @flow
import type { ContextRouter } from 'react-router-dom';
import React, { PureComponent } from 'react';
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

export class ModuleSearchBoxComponent extends PureComponent<Props> {
  static defaultProps = {
    useInstantSearch: false,
    throttle: 300,
  };

  search = (input: string) => {
    this.props.searchModules(input);
  };

  render() {
    return (
      <SearchBox
        throttle={this.props.throttle}
        useInstantSearch={this.props.useInstantSearch}
        initialSearchTerm={this.props.initialSearchTerm}
        placeholder="Module code, names and descriptions"
        onSearch={this.search}
      />
    );
  }
}

export default withRouter(
  connect(
    (state, ownProps) => ({
      searchDescription: state.moduleFinder.search.searchDescription,
      initialSearchTerm: qs.parse(ownProps.location.search)[SEARCH_QUERY_KEY],
    }),
    { searchModules },
  )(ModuleSearchBoxComponent),
);
