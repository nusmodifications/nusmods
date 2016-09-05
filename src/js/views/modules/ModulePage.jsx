import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import { getModule } from 'actions/moduleBank';

export class ModulePage extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    this.props.getModule(this.props.routeParams.moduleCode);
  }

  render() {
    const module = this.props.module;
    return (
      <div>
        {this.props.getModuleRequest.isPending ? <p>Loading...</p> : null}
        {this.props.getModuleRequest.isFailure ? <p>Module not found</p> : null}
        {this.props.getModuleRequest.isSuccessful && module ?
          <div>
            <h4 className="display-4">{module.ModuleCode} {module.ModuleTitle}</h4>
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

              <dt className="col-sm-3">Exam Date</dt>
              <dd className="col-sm-9">{module.ExamDate || 'No exam'}</dd>

            </dl>
          </div> : null
        }
      </div>
    );
  }
}

ModulePage.propTypes = {
  routeParams: PropTypes.object,
  module: PropTypes.object,
  getModule: PropTypes.func,
  getModuleRequest: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  return {
    module: state.entities.moduleBank.modules[ownProps.params.moduleCode],
    getModuleRequest: state.requests.getModuleRequest || {},
  };
}

export default connect(
  mapStateToProps,
  {
    getModule,
  }
)(ModulePage);
