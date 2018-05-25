// @flow
import type { ContextRouter } from 'react-router-dom';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import deferComponentRender from 'views/hocs/deferComponentRender';
import type { ModuleCodeMap } from 'types/reducers';
import type { Module, ModuleCode } from 'types/modules';

import { fetchModule } from 'actions/moduleBank';
import ModulePageContent from 'views/modules/ModulePageContent';
import ModuleNotFoundPage from 'views/errors/ModuleNotFoundPage';
import LoadingSpinner from 'views/components/LoadingSpinner';
import { modulePage } from 'views/routes/paths';

type Props = {
  ...ContextRouter,

  moduleCode: ModuleCode,
  moduleCodes: ModuleCodeMap,
  module: ?Module,
  fetchModule: (ModuleCode) => void,
};

/**
 * Wrapper component that loads both module data and the module page component
 * simultaneously, and displays the correct component depending on the state.
 *
 * - Module data is considered to be loaded when the the data exists in
 *   the module bank
 *
 * We then render the correct component based on the status
 *
 * - Not found: moduleCode not in module list (this is checked synchronously)
 * - Error: Module
 * - Loading: Either requests are pending
 * - Loaded: Both requests are successfully loaded
 */
export class ModulePageContainerComponent extends PureComponent<Props> {
  componentDidMount() {
    this.fetchModule(this.props.moduleCode);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.moduleCode !== this.props.moduleCode) {
      this.fetchModule(this.props.moduleCode);
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
    const { module, moduleCode, match, location } = this.props;

    if (!this.doesModuleExist(moduleCode)) {
      return <ModuleNotFoundPage moduleCode={moduleCode} />;
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

    if (module) {
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
