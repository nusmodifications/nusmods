import * as React from 'react';
import { AxiosError } from 'axios';
import { connect } from 'react-redux';
import { match as Match, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import deferComponentRender from 'views/hocs/deferComponentRender';
import { get } from 'lodash';

import { Module, ModuleCode } from 'types/modules';

import { fetchArchiveRequest, fetchModule, fetchModuleArchive } from 'actions/moduleBank';
import { captureException, retryImport } from 'utils/error';
import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { moduleArchive, modulePage } from 'views/routes/paths';
import { isFailure } from 'selectors/requests';
import { State as StoreState } from 'types/state';

import { Props as ModulePageContentProp } from './ModulePageContent';

type Params = {
  year: string;
  moduleCode: string;
};

type OwnProps = RouteComponentProps<Params>;

type Props = OwnProps & {
  module: Module | null;
  moduleCode: ModuleCode;
  fetchModule: () => Promise<Module>;
  archiveYear?: string;
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
export class ModulePageContainerComponent extends React.PureComponent<Props, State> {
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

  fetchModule() {
    this.props.fetchModule().catch(this.handleFetchError);
  }

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

  canonicalUrl() {
    const { module, moduleCode, archiveYear } = this.props;

    if (!module) {
      throw new Error('canonicalUrl() called before module is loaded');
    }

    return archiveYear
      ? moduleArchive(moduleCode, archiveYear, module.title)
      : modulePage(moduleCode, module.title);
  }

  render() {
    const { ModulePageContent, error } = this.state;
    const { module, moduleCode, match, location, archiveYear } = this.props;

    if (get(error, ['response', 'status'], 200) === 404) {
      return <ModuleNotFoundPage moduleCode={moduleCode} />;
    }

    // If there is an error but module data can still be found, we assume module has
    // been loaded at some point, so we just show that instead
    if (error && !module) {
      return <ApiError dataName="module information" retry={() => this.fetchModule()} />;
    }

    if (module && match.url !== this.canonicalUrl()) {
      return (
        <Redirect
          to={{
            ...location,
            pathname: this.canonicalUrl(),
          }}
        />
      );
    }

    if (module && ModulePageContent) {
      // Unique key forces component to remount whenever the user moves to
      // a new module. This allows the internal state (eg. currently selected
      // timetable semester) of <ModulePageContent> to be consistent
      return <ModulePageContent key={moduleCode} archiveYear={archiveYear} module={module} />;
    }

    return <LoadingSpinner />;
  }
}

const getPropsFromMatch = (match: Match<Params>) => {
  const year = match.params.year;

  return {
    moduleCode: (match.params.moduleCode || '').toUpperCase(),
    year: year && year.replace('-', '/'),
  };
};

const mapStateToProps = (state: StoreState, ownProps: OwnProps) => {
  const { moduleCode, year } = getPropsFromMatch(ownProps.match);
  const { moduleBank } = state;

  // If this is an archive page, load data from the archive
  if (year) {
    return {
      moduleCode,
      archiveYear: year,
      // Use !isFailure to account for loading state
      moduleExists: !isFailure(state, fetchArchiveRequest(moduleCode, year)),
      module: get(moduleBank.moduleArchive, [moduleCode, year], null),
    };
  }

  return {
    moduleCode,
    archiveYear: year,
    moduleExists: !!moduleBank.moduleCodes[moduleCode],
    module: moduleBank.modules[moduleCode],
  };
};

const mapDispatchToProps = (dispatch: Function, ownProps: OwnProps) => {
  const { moduleCode, year } = getPropsFromMatch(ownProps.match);

  return {
    fetchModule: year
      ? () => dispatch(fetchModuleArchive(moduleCode, year))
      : () => dispatch(fetchModule(moduleCode)),
  };
};

const connectedModulePageContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ModulePageContainerComponent);
const routedModulePageContainer = withRouter(connectedModulePageContainer);
export default deferComponentRender(routedModulePageContainer);
