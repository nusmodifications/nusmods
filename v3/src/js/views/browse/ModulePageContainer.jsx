// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDisqusThread from 'react-disqus-thread';
import DocumentTitle from 'react-document-title';
import config from 'config';

import { loadModule } from 'actions/moduleBank';
import { addModule, removeModule } from 'actions/timetables';
import type { Module } from 'types/modules';
import type { FetchRequest } from 'types/reducers';
import { formatExamDate } from 'utils/modules';
import type { TimetableConfig } from 'types/timetables';
import AddModuleButton from './AddModuleButton';
import RemoveModuleButton from './RemoveModuleButton';
import CorsBiddingStatsTableControl from './CorsBiddingStatsTableControl';
import LessonTimetableControl from './LessonTimetableControl';
import ModuleTree from './ModuleTree';

type RouteParams = {
  moduleCode: string,
};
type Props = {
  routeParams: RouteParams,
  module: Module,
  loadModule: Function,
  fetchModuleRequest: FetchRequest,
  timetables: TimetableConfig,
  addModule: Function,
  removeModule: Function,
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

  semestersOffered(): number[] {
    return this.props.module && this.props.module.History ? (
      this.props.module.History
        .sort((a, b) => a.Semester - b.Semester)
        .map(h => h.Semester))
      : [];
  }

  examinations(): {semester: number, date: string}[] {
    return this.props.module && this.props.module.History ? (
      this.props.module.History
        .filter(h => h.ExamDate != null)
        .sort((a, b) => a.Semester - b.Semester)
        .map(h => ({ semester: h.Semester, date: h.ExamDate || '' })))
      : [];
  }

  moduleHasBeenAdded(module: Module, semester: number): boolean {
    if (!module) {
      return false;
    }
    const timetables = this.props.timetables;
    return timetables[semester] && !!timetables[semester][module.ModuleCode];
  }

  props: Props;

  render() {
    const module = this.props.module;
    const documentTitle = module ?
      `${module.ModuleCode} ${module.ModuleTitle} - ${config.brandName}` : 'Not found';
    const ivleLink = module ? config.ivleUrl.replace('<ModuleCode>', module.ModuleCode) : null;
    const corsLink = module ? `${config.corsUrl}${module.ModuleCode}` : null;

    const renderExaminations = this.examinations().map(exam =>
      <span key={exam.semester}>
        <dt className="col-sm-3">Semester {exam.semester} Exam</dt>
        <dd className="col-sm-9">{formatExamDate(exam.date)}</dd>
      </span>
    );

    const semsOffered = this.semestersOffered()
      .map(sem => `Semester ${sem}`)
      .join(', ');

    const addOrRemoveToTimetableLinks = this.semestersOffered().map(
      semester => (
        this.moduleHasBeenAdded(module, semester) ?
          <RemoveModuleButton key={semester} semester={semester} onClick={() =>
            this.props.removeModule(semester, module.ModuleCode)
          }/>
          :
            <AddModuleButton key={semester} semester={semester} onClick={() =>
              this.props.addModule(semester, module.ModuleCode)
            }/>
        )
    );

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

                {renderExaminations}

                <dt className="col-sm-3">Semesters Offered</dt>
                <dd className="col-sm-9">{semsOffered}</dd>

                <dt className="col-sm-3">Offical Links</dt>
                <dd className="col-sm-9">
                  <ul className="nm-footer-links">
                    {ivleLink ? <li><a href={ivleLink}>IVLE</a></li> : null}
                    {corsLink ? <li><a href={corsLink}>CORS</a></li> : null}
                  </ul>
                </dd>

                <div>
                  {addOrRemoveToTimetableLinks}
                </div>

              </dl>

              <hr/>

              {module.ModmavenTree ?
                <ModuleTree module={module} />
                :
                <p>Prerequisites are not available.</p>
              }

              {module.CorsBiddingStats ?
                <CorsBiddingStatsTableControl stats={module.CorsBiddingStats} />
                : null
              }

              <LessonTimetableControl semestersOffered={this.semestersOffered()}
                history={module.History}/>

              <ReactDisqusThread shortname="nusmods-prod"
                identifier={module.ModuleCode}
                title={`${module.ModuleCode} ${module.ModuleTitle}`}
                url={`https://nusmods.com/modules/${module.ModuleCode}/reviews`}
              />

            </div> : null
          }
        </div>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const timetables = state.timetables;
  return {
    module: state.entities.moduleBank.modules[ownProps.params.moduleCode],
    fetchModuleRequest: state.requests.fetchModuleRequest || {},
    timetables,
  };
}

export default connect(
  mapStateToProps,
  {
    addModule,
    loadModule,
    removeModule,
  }
)(ModulePageContainer);
