import * as React from 'react';
import { AxiosError } from 'axios';
import { connect, MapDispatchToPropsNonObject } from 'react-redux';
import { match as Match, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import deferComponentRender from 'views/hocs/deferComponentRender';
import { get } from 'lodash';

import type { Module, ModuleCode } from 'types/modules';
import type { Dispatch } from 'types/redux';
import type { State as StoreState } from 'types/state';

import { fetchModule } from 'actions/moduleBank';
import { captureException } from 'utils/error';
import retryImport from 'utils/retryImport';
import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { modulePage } from 'views/routes/paths';

import { Props as ModulePageContentProp } from './ModulePageContent';

type Params = {
  moduleCode: string;
};

type OwnProps = RouteComponentProps<Params>;

type DispatchProps = {
  fetchModule: () => Promise<Module>;
};

type Props = OwnProps &
  DispatchProps & {
    module: Module | null;
    moduleCode: ModuleCode;
    fetchModule: () => Promise<Module>;
  };

type State = {
  ModulePageContent: React.ComponentType<ModulePageContentProp> | null;
  error?: Error;
};

/**
 * Wrapper component that loads both module data and the module page component
 * simultaneously, and displays the correct component depending on the state.
 *
 * - Module data is considered to be loaded when the the data exists in
 *   the module bank
 * - Component is loaded when the dynamic import() Promise resolves
 *
 * We then render the correct component based on the status
 *
 * - Not found: moduleCode not in module list (this is checked synchronously)
 * - Error: Either requests failed
 * - Loading: Either requests are pending
 * - Loaded: Both requests are successfully loaded
 */
class ModulePageContainer extends React.PureComponent<Props, State> {
  state: State = {
    ModulePageContent: null,
  };

  componentDidMount() {
    this.fetchModule();
    this.fetchPageImport();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.moduleCode !== this.props.moduleCode) {
      this.fetchModule();
    }
  }

  fetchModule = () => {
    this.setState({ error: undefined });
    this.props.fetchModule().catch(this.handleFetchError);
  };

  fetchPageImport() {
    // Try importing ModulePageContent thrice if we're online and
    // getting the "Loading chunk x failed." error.
    retryImport(() => import(/* webpackChunkName: "module" */ 'views/modules/ModulePageContent'))
      .then((module) => this.setState({ ModulePageContent: module.default }))
      .catch(this.handleFetchError);
  }

  handleFetchError = (error: AxiosError) => {
    this.setState({ error });
    captureException(error);
  };

  render() {
    const { ModulePageContent, error } = this.state;
    const { module, moduleCode, match, location } = this.props;

    if (get(error, ['response', 'status'], 200) === 404) {
      return <ModuleNotFoundPage moduleCode={moduleCode} tryArchive />;
    }

    // If there is an error but module data can still be found, we assume module has
    // been loaded at some point, so we just show that instead
    if (error && !module) {
      return <ApiError dataName="module information" retry={this.fetchModule} />;
    }

    // Redirect to canonical URL
    if (module && match.url !== modulePage(moduleCode, module.title)) {
      return <Redirect to={{ ...location, pathname: modulePage(moduleCode, module.title) }} />;
    }

    if (module && ModulePageContent) {
      // Unique key forces component to remount whenever the user moves to
      // a new module. This allows the internal state (eg. currently selected
      // timetable semester) of <ModulePageContent> to be consistent
      return <ModulePageContent key={moduleCode} module={module} />;
    }

    return <LoadingSpinner />;
  }
}

const getPropsFromMatch = (match: Match<Params>) => ({
  moduleCode: (match.params.moduleCode ?? '').toUpperCase(),
});

const mapStateToProps = ({ moduleBank }: StoreState, ownProps: OwnProps) => {
  const { moduleCode } = getPropsFromMatch(ownProps.match);
  return {
    moduleCode,
    module: moduleBank.modules[moduleCode],
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => {
  const { moduleCode } = getPropsFromMatch(ownProps.match);
  return {
    fetchModule: () => dispatch(fetchModule(moduleCode)),
  };
};

const connectedModulePageContainer = connect(
  mapStateToProps,
  // Cast required because the version of Dispatch defined by connect does not have the extensions defined
  // in our Dispatch
  mapDispatchToProps as MapDispatchToPropsNonObject<DispatchProps, OwnProps>,
)(ModulePageContainer);
export const ModulePageContainerComponent = withRouter(connectedModulePageContainer);
export default deferComponentRender(ModulePageContainerComponent);
