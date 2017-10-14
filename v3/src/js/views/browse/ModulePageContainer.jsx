// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import type { FetchRequest } from 'types/reducers';
import type { Module, ModuleCode } from 'types/modules';

import { loadModule, FETCH_MODULE } from 'actions/moduleBank';
import { getRequestName } from 'reducers/requests';
import NotFoundPage from 'views/NotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';

type Props = {
  moduleCode: ModuleCode,
  moduleCodes: Set<ModuleCode>,
  module: ?Module,
  request: ?FetchRequest,
  loadModule: (ModuleCode) => void,
};

type State = {
  ModulePageContent: ?ComponentType<*>;
}

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
    this.loadModule(this.props.moduleCode);

    import('views/browse/ModulePageContent')
      // TODO: Error handling
      .then(module => this.setState({ ModulePageContent: module.default }));
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.moduleCode !== this.props.moduleCode) {
      this.loadModule(nextProps.moduleCode);
    }
  }

  loadModule(moduleCode: ModuleCode) {
    if (this.doesModuleExist(moduleCode)) {
      this.props.loadModule(moduleCode);
    }
  }

  doesModuleExist(moduleCode: ModuleCode) {
    return this.props.moduleCodes.has(moduleCode);
  }

  render() {
    const { ModulePageContent } = this.state;
    const { module, request, moduleCode } = this.props;

    if (!this.doesModuleExist(moduleCode)) {
      return <NotFoundPage />;
    }

    if (request && request.isFailure) {
      // TODO: Display a proper error page here
      return <NotFoundPage />;
    }

    if (module && ModulePageContent) {
      return <ModulePageContent moduleCode={moduleCode} />;
    }

    return <LoadingSpinner />;
  }
}

const mapStateToProps = (state, ownState) => {
  const moduleCode = ownState.match.params.moduleCode;
  const requestName = getRequestName(FETCH_MODULE);

  return {
    moduleCode,
    moduleCodes: state.entities.moduleBank.moduleCodes,
    module: state.entities.moduleBank.modules[moduleCode],
    request: state.requests[requestName],
  };
};

export default withRouter(
  connect(mapStateToProps, { loadModule })(ModulePageContainerComponent),
);
