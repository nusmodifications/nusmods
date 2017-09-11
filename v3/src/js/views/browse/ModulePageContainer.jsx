// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactDisqusThread from 'react-disqus-thread';
import Helmet from 'react-helmet';

import type { Module, Semester, ModuleCode } from 'types/modules';
import type { FetchRequest } from 'types/reducers';
import type { TimetableConfig } from 'types/timetables';

import config from 'config';
import { loadModule } from 'actions/moduleBank';
import { addModule, removeModule } from 'actions/timetables';
import { formatExamDate } from 'utils/modules';
import { join } from 'utils/react';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import ModuleDescription from 'views/components/module-info/ModuleDescription';

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
    const module = this.props.module;
    if (!module || !module.History) return [];
    return module.History
      .map(h => h.Semester)
      .sort();
  }

  examinations(): {semester: Semester, date: string}[] {
    const module = this.props.module;
    if (!module || !module.History) return [];
    return module.History
      .filter(h => h.ExamDate != null)
      .sort((a, b) => a.Semester - b.Semester)
      .map(h => ({ semester: h.Semester, date: h.ExamDate || '' }));
  }

  moduleHasBeenAdded(module: Module, semester: Semester): boolean {
    if (!module) {
      return false;
    }
    const timetables = this.props.timetables;
    return timetables[semester] && !!timetables[semester][module.ModuleCode];
  }

  render() {
    const { module } = this.props;
    const documentTitle = module ?
      `${module.ModuleCode} ${module.ModuleTitle} - ${config.brandName}` : 'Not found';

    return (
      <div className="module-container page-container">
        <Helmet>
          <title>{ documentTitle }</title>
        </Helmet>

        {this.props.fetchModuleRequest.isPending && !module && <p>Loading...</p>}
        {this.props.fetchModuleRequest.isFailure && <p>Module not found</p>}
        {(this.props.fetchModuleRequest.isSuccessful || module) &&
          <div className="row">
            <div className="col-sm-12">
              <header>
                <h1 className="page-title">
                  <span className="page-title-module-code">{module.ModuleCode}</span>
                  {module.ModuleTitle}
                </h1>

                <p>{ join([
                  <a key="department">{module.Department}</a>,
                  <a key="mc">{module.ModuleCredit} MCs</a>,
                  ...this.semestersOffered().map(semester =>
                    <a key={semester}>{ config.semesterNames[semester] }</a>),
                ]) }</p>
              </header>
            </div>

            <div className="col-xl-9">
              <div className="row">
                <div className="col-sm-9 col-lg-8">
                  { module.ModuleDescription && <p>
                    <ModuleDescription>{module.ModuleDescription}</ModuleDescription>
                  </p> }

                  <dl>
                    {module.Prerequisite && [
                      <dt key="prerequisite-dt">Prerequisite</dt>,
                      <dd key="prerequisite-dd">
                        <LinkModuleCodes>{module.Prerequisite}</LinkModuleCodes>
                      </dd>,
                    ]}

                    {module.Corequisite && [
                      <dt key="corequisite-dt">Corequisite</dt>,
                      <dd key="corequisite-dd">
                        <LinkModuleCodes>{module.Corequisite}</LinkModuleCodes>
                      </dd>,
                    ]}

                    {module.Preclusion && [
                      <dt key="preclusions-dt">Preclusion</dt>,
                      <dd key="preclusions-dd">
                        <LinkModuleCodes>{module.Preclusion}</LinkModuleCodes>
                      </dd>,
                    ]}
                  </dl>
                </div>

                <div className="col-sm-3 col-lg-4 module-page-sidebar">
                  <div>
                    {this.semestersOffered().map(
                      semester => (
                        this.moduleHasBeenAdded(module, semester) ?
                          <button
                            key={semester}
                            className="btn btn-outline-primary"
                            onClick={() => this.props.removeModule(semester, module.ModuleCode)}
                          >
                            Remove from {config.semesterNames[semester]}
                          </button>
                          :
                          <button
                            key={semester}
                            className="btn btn-outline-primary"
                            onClick={() => this.props.addModule(semester, module.ModuleCode)}
                          >
                            Add to {config.semesterNames[semester]}
                          </button>
                      ),
                    )}
                  </div>

                  {this.examinations().map(exam => (
                    <div>
                      <h3>{config.semesterNames[exam.semester]} Exam</h3>
                      <p>{formatExamDate(exam.date)}</p>
                    </div>
                  ))}

                  <div>
                    <h3>Official Links</h3>
                    { join([
                      <a key="ivle" href={config.ivleUrl.replace('<ModuleCode>', module.ModuleCode)}>IVLE</a>,
                      <a key="cors" href={config.corsUrl + module.ModuleCode}>CORS</a>,
                    ]) }
                  </div>
                </div>
              </div>

              <h2>Prerequisite Tree</h2>
              {module.ModmavenTree ?
                <ModuleTree module={module} />
                :
                <p>Prerequisites are not available.</p>
              }

              {module.CorsBiddingStats && <div>
                <h2>CORS Bidding Stats</h2>
                <CorsBiddingStatsTableControl stats={module.CorsBiddingStats} />
              </div>}

              <div>
                <h2>Timetable</h2>
                <LessonTimetableControl
                  semestersOffered={this.semestersOffered()}
                  history={module.History}
                />
              </div>

              <h2>Review and Discussion</h2>
              <ReactDisqusThread
                shortname={config.disqusShortname}
                identifier={module.ModuleCode}
                title={`${module.ModuleCode} ${module.ModuleTitle}`}
                url={`https://nusmods.com/modules/${module.ModuleCode}/reviews`}
              />
            </div>
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
