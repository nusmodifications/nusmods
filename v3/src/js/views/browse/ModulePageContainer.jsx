// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import config from 'config';

import { loadModule } from 'actions/moduleBank';
import type { Module } from 'types/modules';
import type { FetchRequest } from 'types/reducers';
import { dateForDisplay } from 'utils/date';

type RouteParams = {
  moduleCode: string,
};
type Props = {
  routeParams: RouteParams,
  module: Module,
  loadModule: Function,
  fetchModuleRequest: FetchRequest,
};

export class ModulePageContainer extends Component {

  componentDidMount() {
    this.loadModuleInformation(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.routeParams.moduleCode !== this.props.routeParams.moduleCode) {
      this.loadModuleInformation(nextProps);
    }
  }

  loadModuleInformation(props: Props) {
    this.props.loadModule(props.routeParams.moduleCode);
  }

  props: Props;

  render() {
    const module = this.props.module;
    const documentTitle = module ?
      `${module.ModuleCode} ${module.ModuleTitle} - ${config.brandName}` : 'Not found';
    const sem1History = module.History.find(h => h.Semester === 1);
    const sem2History = module.History.find(h => h.Semester === 2);
    return (
      <DocumentTitle title={documentTitle}>
        <div className="module-container">
          {this.props.fetchModuleRequest.isPending && !module ?
            <p>Loading...</p> : null
          }
          {this.props.fetchModuleRequest.isFailure ? <p>Module not found</p> : null}
          {this.props.fetchModuleRequest.isSuccessful || module ?
            <div>
              <h1 className="page-title">{module.ModuleCode} {module.ModuleTitle}</h1>
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

                {sem1History ? <dt className="col-sm-3">Semester 1 Exam</dt> : null}
                {sem1History ? <dd className="col-sm-9">{dateForDisplay(sem1History.ExamDate)}</dd> : null}

                {sem2History ? <dt className="col-sm-3">Semester 2 Exam</dt> : null}
                {sem2History ? <dd className="col-sm-9">{dateForDisplay(sem2History.ExamDate)}</dd> : null}

                {/* TODO: Add in exam date for each semester. */}

              </dl>
            </div> : null
          }
        </div>
      </DocumentTitle>
    );
  }
}

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
