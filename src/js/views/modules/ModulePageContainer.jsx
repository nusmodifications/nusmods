import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { loadModule } from 'actions/moduleBank';

function loadModuleInformation(props) {
  props.loadModule(props.routeParams.moduleCode);
}

export class ModulePageContainer extends Component {
  componentDidMount() {
    loadModuleInformation(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.routeParams.moduleCode !== this.props.routeParams.moduleCode) {
      loadModuleInformation(nextProps);
    }
  }

  render() {
    const module = this.props.module;
    return (
      <div>
        {this.props.fetchModuleRequest.isPending && !module ?
          <p>Loading...</p> : null
        }
        {this.props.fetchModuleRequest.isFailure ? <p>Module not found</p> : null}
        {this.props.fetchModuleRequest.isSuccessful || module ?
          <div>
            <h1 className="display-4">{module.ModuleCode} {module.ModuleTitle}</h1>
            <hr/>
            <dl className="row">
              {module.ModuleDescription ? <dt className="col-sm-3">Description</dt> : null}
              {module.ModuleDescription ?
                <dd className="col-sm-9">{module.ModuleDescription}</dd> : null}

              {module.ModuleCredit ? <dt className="col-sm-3">Module Credits (MCs)</dt> : null}
              {module.ModuleCredit ? <dd className="col-sm-9">{module.ModuleCredit}</dd> : null}

              {module.Prerequisite ? <dt className="col-sm-3">Prerequisite(s)</dt> : null}
              {module.Prerequisite ? <dd className="col-sm-9">{module.Prerequisite}</dd> : null}

              {module.Corequisite ? <dt className="col-sm-3">Corequisite(s)</dt> : null}
              {module.Corequisite ? <dd className="col-sm-9">{module.Corequisite}</dd> : null}

              {module.Preclusion ? <dt className="col-sm-3">Preclusion(s)</dt> : null}
              {module.Preclusion ? <dd className="col-sm-9">{module.Preclusion}</dd> : null}

              {module.Department ? <dt className="col-sm-3">Department</dt> : null}
              {module.Department ? <dd className="col-sm-9">{module.Department}</dd> : null}

              {module.Workload ? <dt className="col-sm-3">Weekly Workload</dt> : null}
              {module.Workload ? <dd className="col-sm-9">{module.Workload}</dd> : null}

              {/* TODO: Add in exam date for each semester. */}

            </dl>
          </div> : null
        }
      </div>
    );
  }
}

ModulePageContainer.propTypes = {
  routeParams: PropTypes.object,
  module: PropTypes.object,
  loadModule: PropTypes.func,
  fetchModuleRequest: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  return {
    module: state.entities.moduleBank.modules[ownProps.params.moduleCode],
    fetchModuleRequest: state.requests.fetchModuleRequest || {},
  };
}

export default connect(
  mapStateToProps,
  {
    loadModule,
  }
)(ModulePageContainer);
