// @flow
import type { ContextRouter } from 'react-router-dom';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import Raven from 'raven-js';

import type { FetchRequest, ModuleCodeMap } from 'types/reducers';
import type { Module, ModuleCode } from 'types/modules';

import { fetchModule, FETCH_MODULE } from 'actions/moduleBank';
import { getRequestName } from 'reducers/requests';
import NotFoundPage from 'views/errors/NotFoundPage';
import ErrorPage from 'views/errors/ErrorPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { modulePage } from 'views/routes/paths';

type Props = {
  ...ContextRouter,

  moduleCode: ModuleCode,
  moduleCodes: ModuleCodeMap,
  module: ?Module,
  request: ?FetchRequest,
  fetchModule: (ModuleCode) => void,
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

  componentWillMount() {
    this.fetchModule(this.props.moduleCode);

    import('views/modules/ModulePageContent')
      .then(module => this.setState({ ModulePageContent: module.default }))
      .catch((error) => {
        Raven.captureException(error);
        this.setState({ error });
      });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.moduleCode !== this.props.moduleCode) {
      this.fetchModule(nextProps.moduleCode);
    }
  }

  fetchModule(moduleCode: ModuleCode) {
    if (this.doesModuleExist(moduleCode)) {
      this.props.fetchModule(moduleCode);
    }
  }

  doesModuleExist(moduleCode: ModuleCode): boolean {
    return !!this.props.moduleCodes[moduleCode];
  }

  canonicalUrl() {
    if (!this.props.module) throw new Error('canonicalUrl() called before module is loaded');
    return modulePage(this.props.moduleCode, this.props.module.ModuleTitle);
  }

  render() {
    const { ModulePageContent, error } = this.state;
    const { module, request, moduleCode, match } = this.props;

    if (!this.doesModuleExist(moduleCode)) {
      return <NotFoundPage />;
    }

    if (error || (request && request.isFailure)) {
      return <ErrorPage eventId={Raven.lastEventId()} />;
    }

    if (module && match.url !== this.canonicalUrl()) {
      return <Redirect to={this.canonicalUrl()} />;
    }

    if (module && ModulePageContent) {
      return <ModulePageContent moduleCode={moduleCode} />;
    }

    return <LoadingSpinner />;
  }
}

const mapStateToProps = (state, ownState) => {
  const moduleCode = ownState.match.params.moduleCode.toUpperCase();
  const requestName = getRequestName(FETCH_MODULE);

  return {
    moduleCode,
    moduleCodes: state.entities.moduleBank.moduleCodes,
    module: state.entities.moduleBank.modules[moduleCode],
    request: state.requests[requestName],
  };
};

const connectedModulePageContainer = connect(mapStateToProps, { fetchModule })(ModulePageContainerComponent);
export default withRouter(connectedModulePageContainer);
