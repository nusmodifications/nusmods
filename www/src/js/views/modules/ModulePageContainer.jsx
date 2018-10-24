// @flow
import type { ContextRouter, Match } from 'react-router-dom';
import type { $AxiosError } from 'axios';
import type { Dispatch } from 'redux';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import deferComponentRender from 'views/hocs/deferComponentRender';
import { get } from 'lodash';
import Raven from 'raven-js';

import type { Module, ModuleCode } from 'types/modules';
import type { State as StoreState } from 'reducers';

import { fetchArchiveRequest, fetchModule, fetchModuleArchive } from 'actions/moduleBank';
import { retry } from 'utils/promise';
import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { moduleArchive, modulePage } from 'views/routes/paths';
import { isFailure } from 'selectors/requests';

type Props = {
  ...ContextRouter,

  moduleExists: boolean,
  archiveYear: ?string,
  moduleCode: ModuleCode,
  module: ?Module,
  fetchModule: () => Promise<*>,
};

type State = {
  ModulePageContent: ?ComponentType<*>,
  error?: any,
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
export class ModulePageContainerComponent extends PureComponent<Props, State> {
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
    if (this.props.moduleExists || this.props.archiveYear) {
      this.props.fetchModule().catch(this.handleFetchError);
    }
  }

  fetchPageImport() {
    // Try importing ModulePageContent thrice if we're online and
    // getting the "Loading chunk x failed." error.
    retry(
      3,
      () => import(/* webpackChunkName: "module" */ 'views/modules/ModulePageContent'),
      (error) => error.message.includes('Loading chunk ') && window.navigator.onLine,
    )
      .then((module) => this.setState({ ModulePageContent: module.default }))
      .catch(this.handleFetchError);
  }

  handleFetchError = (error: $AxiosError<*>) => {
    this.setState({ error });
    Raven.captureException(error);
  };

  canonicalUrl() {
    if (!this.props.module) {
      throw new Error('canonicalUrl() called before module is loaded');
    }

    return this.props.archiveYear
      ? moduleArchive(this.props.moduleCode, this.props.archiveYear, this.props.module.ModuleTitle)
      : modulePage(this.props.moduleCode, this.props.module.ModuleTitle);
  }

  render() {
    const { ModulePageContent, error } = this.state;
    const { module, moduleCode, moduleExists, match, location } = this.props;

    if (!moduleExists) {
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
      return <ModulePageContent module={module} archiveYear={this.props.archiveYear} />;
    }

    return <LoadingSpinner />;
  }
}

const getPropsFromMatch = (match: Match) => {
  const year = match.params.year;

  return {
    moduleCode: (match.params.moduleCode || '').toUpperCase(),
    year: year ? year.replace('-', '/') : null,
  };
};

const mapStateToProps = (state: StoreState, ownProps) => {
  const { moduleCode, year } = getPropsFromMatch(ownProps.match);

  return {
    archiveYear: year,
    moduleCode,
    moduleExists: year
      ? // Use !isFailure to account for loading state
        !isFailure(state, fetchArchiveRequest(moduleCode, year))
      : state.moduleBank.moduleCodes[moduleCode],
    module: year
      ? get(state.moduleBank.moduleArchive, [moduleCode, year], null)
      : state.moduleBank.modules[moduleCode],
  };
};

const mapDispatchToProps = (dispatch: Dispatch<*>, ownProps) => {
  const { moduleCode, year } = getPropsFromMatch(ownProps.match);

  return {
    fetchModule: year
      ? () => dispatch(fetchModuleArchive(moduleCode, year))
      : () => dispatch(fetchModule(moduleCode)),
  };
};

const connectedModulePageContainer = connect(mapStateToProps, mapDispatchToProps)(
  ModulePageContainerComponent,
);
const routedModulePageContainer = withRouter(connectedModulePageContainer);
export default deferComponentRender(routedModulePageContainer);
