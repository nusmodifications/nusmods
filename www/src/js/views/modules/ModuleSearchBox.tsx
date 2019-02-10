import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import qs from 'query-string';
import classnames from 'classnames';

import { State } from 'reducers';
import elements from 'views/elements';
import SearchBox from 'views/components/SearchBox';
import { searchModules } from 'actions/moduleFinder';
import { SEARCH_QUERY_KEY } from 'utils/moduleSearch';

type OwnProps = RouteComponentProps & {
  throttle: number;
  useInstantSearch: boolean;
  searchModules: (str: string) => void;
};

type Props = OwnProps & {
  initialSearchTerm: string | undefined;
};

export function ModuleSearchBoxComponent(props: Props) {
  return (
    <SearchBox
      className={classnames(elements.moduleFinderSearchBox, 'search-panel')}
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
    (state: State, ownProps: OwnProps) => ({
      initialSearchTerm: qs.parse(ownProps.location.search)[SEARCH_QUERY_KEY],
    }),
    { searchModules },
  )(ModuleSearchBoxComponent),
);
