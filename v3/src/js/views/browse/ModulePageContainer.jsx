// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactDisqusThread from 'react-disqus-thread';
import Helmet from 'react-helmet';
import config from 'config';

import type { Module, Semester, ModuleCode } from 'types/modules';
import type { FetchRequest } from 'types/reducers';
import type { TimetableConfig } from 'types/timetables';

import { loadModule } from 'actions/moduleBank';
import { addModule, removeModule } from 'actions/timetables';
import { formatExamDate } from 'utils/modules';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import ModuleDescription from 'views/components/module-info/ModuleDescription';
import AddModuleButton from './AddModuleButton';
import RemoveModuleButton from './RemoveModuleButton';
import CorsBiddingStatsTableControl from './CorsBiddingStatsTableControl';
import LessonTimetableControl from './LessonTimetableControl';
import ModuleTree from './ModuleTree';

type Props = {
  moduleCode: string,
  module: Module,
  loadModule: (ModuleCode) => void,
  fetchModuleRequest: FetchRequest,
  timetables: TimetableConfig,
  addModule: Function,
  removeModule: Function,
};

class ModulePageContainer extends Component<Props> {
  props: Props;

  componentDidMount() {
    this.loadModuleInformation(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.moduleCode !== this.props.moduleCode) {
      this.loadModuleInformation(nextProps);
    }
  }

  loadModuleInformation({ moduleCode }: Props) {
    this.props.loadModule(moduleCode);
  }

  semestersOffered(): Semester[] {
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

  moduleHasBeenAdded(module: Module, semester: Semester): boolean {
    if (!module) {
      return false;
    }
    const timetables = this.props.timetables;
    return timetables[semester] && !!timetables[semester][module.ModuleCode];
  }

  render() {
    const module = this.props.module;
    const documentTitle = module ?
      `${module.ModuleCode} ${module.ModuleTitle} - ${config.brandName}` : 'Not found';
    const ivleLink = module ? config.ivleUrl.replace('<ModuleCode>', module.ModuleCode) : null;
    const corsLink = module ? `${config.corsUrl}${module.ModuleCode}` : null;

    const renderExaminations = this.examinations().map(exam => (
      <span key={exam.semester}>
        <dt className="col-sm-3">Semester {exam.semester} Exam</dt>
        <dd className="col-sm-9">{formatExamDate(exam.date)}</dd>
      </span>
    ));

    const semsOffered = this.semestersOffered()
      .map(sem => `Semester ${sem}`)
      .join(', ');

    const addOrRemoveToTimetableLinks = this.semestersOffered().map(
      semester => (
        this.moduleHasBeenAdded(module, semester) ?
          <RemoveModuleButton
            key={semester}
            semester={semester}
            onClick={() =>
              this.props.removeModule(semester, module.ModuleCode)
            }
          />
          :
          <AddModuleButton
            key={semester}
            semester={semester}
            onClick={() =>
              this.props.addModule(semester, module.ModuleCode)
            }
          />
      ),
    );

    return (
      <div className="module-container page-container">
        <Helmet>
          <title>{ documentTitle }</title>
        </Helmet>

        {this.props.fetchModuleRequest.isPending && !module && <p>Loading...</p>}
        {this.props.fetchModuleRequest.isFailure && <p>Module not found</p>}
        {(this.props.fetchModuleRequest.isSuccessful || module) &&
          <div>
            <h1 className="page-title">{module.ModuleCode} {module.ModuleTitle}</h1>
            <hr />
            <dl className="row">
              {module.ModuleDescription && [
                <dt className="col-sm-3">Description</dt>,
                <dd className="col-sm-9">
                  <ModuleDescription>{module.ModuleDescription}</ModuleDescription>
                </dd>,
              ]}
              {module.ModuleCredit && [
                <dt className="col-sm-3">Module Credits (MCs)</dt>,
                <dd className="col-sm-9">{module.ModuleCredit}</dd>,
              ]}
              {module.Prerequisite && [
                <dt className="col-sm-3">Prerequisite(s)</dt>,
                <dd className="col-sm-9">
                  <LinkModuleCodes>{module.Prerequisite}</LinkModuleCodes>
                </dd>,
              ]}
              {module.Corequisite && [
                <dt className="col-sm-3">Corequisite(s)</dt>,
                <dd className="col-sm-9">
                  <LinkModuleCodes>{module.Corequisite}</LinkModuleCodes>
                </dd>,
              ]}
              {module.Preclusion && [
                <dt className="col-sm-3">Preclusion(s)</dt>,
                <dd className="col-sm-9">
                  <LinkModuleCodes>{module.Preclusion}</LinkModuleCodes>
                </dd>,
              ]}
              {module.Department && [
                <dt className="col-sm-3">Department</dt>,
                <dd className="col-sm-9">{module.Department}</dd>,
              ]}
              {module.Workload && [
                <dt className="col-sm-3">Weekly Workload</dt>,
                <dd className="col-sm-9">{module.Workload}</dd>,
              ]}
              {renderExaminations}
              <dt className="col-sm-3">Semesters Offered</dt>
              <dd className="col-sm-9">{semsOffered}</dd>
              <dt className="col-sm-3">Official Links</dt>
              <dd className="col-sm-9">
                <ul className="nm-footer-links">
                  {ivleLink && <li><a href={ivleLink}>IVLE</a></li>}
                  {corsLink && <li><a href={corsLink}>CORS</a></li>}
                </ul>
              </dd>
              <div>
                {addOrRemoveToTimetableLinks}
              </div>
            </dl>
            <hr />
            {module.ModmavenTree ?
              <ModuleTree module={module} />
              :
              <p>Prerequisites are not available.</p>
            }
            {module.CorsBiddingStats &&
              <CorsBiddingStatsTableControl stats={module.CorsBiddingStats} />
            }
            <LessonTimetableControl
              semestersOffered={this.semestersOffered()}
              history={module.History}
            />
            <ReactDisqusThread
              shortname={config.disqusShortname}
              identifier={module.ModuleCode}
              title={`${module.ModuleCode} ${module.ModuleTitle}`}
              url={`https://nusmods.com/modules/${module.ModuleCode}/reviews`}
            />
          </div>
        }
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const timetables = state.timetables;
  const moduleCode = ownProps.match.params.moduleCode;
  return {
    moduleCode,
    module: state.entities.moduleBank.modules[moduleCode],
    fetchModuleRequest: state.requests.fetchModuleRequest || {},
    timetables,
  };
}

export default withRouter(
  connect(mapStateToProps, {
    addModule,
    loadModule,
    removeModule,
  })(ModulePageContainer),
);
