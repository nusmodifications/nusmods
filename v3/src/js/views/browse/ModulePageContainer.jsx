// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import type { FetchRequest } from 'types/reducers';
import type { Module, ModuleCode } from 'types/modules';

import { loadModule } from 'actions/moduleBank';
import NotFoundPage from 'views/NotFoundPage';
import LoadingSpinner from 'views/LoadingSpinner';

type Props = {
  moduleCode: ModuleCode,
  loadModule: (ModuleCode) => void,
  module: ?Module,
  fetchModuleRequest: ?FetchRequest,
};

type State = {
  ModulePageContent: ?ComponentType<*>;
}

/**
 * Wrapper component that loads both module data and the module page component
 * simultaneously, and displays the correct component depending on the state.
 *
 * - Module data is loaded when the the data exists in the module bank
 * - Component is loaded when the dynamic import() Promise resolves
 *
 * We then dispatch the correct component based on the status
 *
 * - Loading: Either requests are pending
 * - Not found: fetchModuleRequest failed with 404
 * - Loaded: Both requests are successfully loaded
 * TODO: Implement this last state
 * - Error: Either request did not complete, and fetchModuleRequest did not fail with 404
 */
export class ModulePageContainerComponent extends PureComponent<Props, State> {
  props: Props;

  state: State = {
    ModulePageContent: null,
  };

  componentWillMount() {
    this.props.loadModule(this.props.moduleCode);

    import('views/browse/ModulePageContent')
    // TODO: Error handling
      .then(module => this.setState({ ModulePageContent: module.default }));
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.moduleCode !== this.props.moduleCode) {
      this.props.loadModule(nextProps.moduleCode);
    }
  }

  render() {
    const { ModulePageContent } = this.state;
    const { module, fetchModuleRequest, moduleCode } = this.props;

    if (module && ModulePageContent) {
      return <ModulePageContent moduleCode={moduleCode} />;
    }

    if (fetchModuleRequest && fetchModuleRequest.isFailure) {
      return <NotFoundPage />;
    }

    return <LoadingSpinner />;
  }
}

const mapStateToProps = (state, ownState) => {
  const moduleCode = ownState.match.params.moduleCode;

  return {
    moduleCode,
    module: state.entities.moduleBank.modules[moduleCode],
    fetchModuleRequest: state.requests.fetchModuleRequest || {},
  };
};

export default withRouter(
  connect(mapStateToProps, { loadModule })(ModulePageContainerComponent),
);
