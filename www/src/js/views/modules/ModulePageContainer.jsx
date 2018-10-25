// @flow
import type { ContextRouter } from 'react-router-dom';
import type { $AxiosError } from 'axios';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import deferComponentRender from 'views/hocs/deferComponentRender';
import Raven from 'raven-js';

import type { ModuleCodeMap } from 'types/reducers';
import type { Module, ModuleCode } from 'types/modules';

import { fetchModule } from 'actions/moduleBank';
import { retry } from 'utils/promise';
import ApiError from 'views/errors/ApiError';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { modulePage } from 'views/routes/paths';

type Props = {
  ...ContextRouter,

  moduleCode: ModuleCode,
  moduleCodes: ModuleCodeMap,
  module: ?Module,
  fetchModule: (ModuleCode) => Promise<*>,
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
    this.fetchModule(this.props.moduleCode);
    this.fetchPageImport();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.moduleCode !== this.props.moduleCode) {
      this.fetchModule(this.props.moduleCode);
    }
  }

  fetchModule(moduleCode: ModuleCode) {
    if (this.doesModuleExist(moduleCode)) {
      this.props.fetchModule(moduleCode).catch(this.handleFetchError);
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

  doesModuleExist(moduleCode: ModuleCode): boolean {
    return !!this.props.moduleCodes[moduleCode];
  }

  canonicalUrl() {
    if (!this.props.module) throw new Error('canonicalUrl() called before module is loaded');
    return modulePage(this.props.moduleCode, this.props.module.ModuleTitle);
  }

  render() {
    const { ModulePageContent, error } = this.state;
    const { module, moduleCode, match, location } = this.props;

    if (!this.doesModuleExist(moduleCode)) {
      return <ModuleNotFoundPage moduleCode={moduleCode} />;
    }

    // If there is an error, but module already exists, we assume module has
    // been loaded at some point, so we just show that instead
    if (error && !module) {
      return <ApiError dataName="module information" retry={() => this.fetchModule(moduleCode)} />;
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
      return <ModulePageContent moduleCode={moduleCode} />;
    }

    return <LoadingSpinner />;
  }
}

const mapStateToProps = (state, ownState) => {
  const moduleCode = ownState.match.params.moduleCode.toUpperCase();

  return {
    moduleCode,
    moduleCodes: state.moduleBank.moduleCodes,
    module: state.moduleBank.modules[moduleCode],
  };
};

const connectedModulePageContainer = connect(mapStateToProps, { fetchModule })(
  ModulePageContainerComponent,
);
const routedModulePageContainer = withRouter(connectedModulePageContainer);
export default deferComponentRender(routedModulePageContainer);
