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
  useInstantSearch: boolean;
};

type Props = OwnProps & {
  searchModules: (str: string) => void;
  initialSearchTerm?: string;
};

export const ModuleSearchBoxComponent: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <SearchBox
      className={classnames(elements.moduleFinderSearchBox, 'search-panel')}
      throttle={300}
      useInstantSearch={props.useInstantSearch}
      initialSearchTerm={props.initialSearchTerm || null}
      placeholder="Module code, names and descriptions"
      onSearch={props.searchModules}
    />
  );
};

const ConnectedModuleSearchBox = connect(
  (state: State, ownProps: OwnProps) => ({
    initialSearchTerm: qs.parse(ownProps.location.search)[SEARCH_QUERY_KEY],
  }),
  { searchModules },
)(ModuleSearchBoxComponent);

export default withRouter(ConnectedModuleSearchBox);
