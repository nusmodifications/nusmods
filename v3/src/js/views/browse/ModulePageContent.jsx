// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import type { Module, Semester } from 'types/modules';
import type { TimetableConfig } from 'types/timetables';

import config from 'config';
import { addModule, removeModule } from 'actions/timetables';
import { formatExamDate } from 'utils/modules';
import { intersperse } from 'utils/array';
import { BULLET } from 'utils/react';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import LessonTimetable from 'views/components/module-info/LessonTimetable';
import ScrollMenu from 'views/components/scroll-menu/ScrollMenu';
import ScrollItem from 'views/components/scroll-menu/ScrollItem';
import CorsBiddingStatsTableControl from './CorsBiddingStatsTableControl';

const MENU_ID = 'module-page';
const TOP_OFFSET = 30;

type Props = {
  module: Module,
  timetables: TimetableConfig,
  addModule: Function,
  removeModule: Function,
};

class ModulePageContentComponent extends Component<Props> {
  props: Props;

  semestersOffered(): Semester[] {
    return this.props.module.History
      .map(h => h.Semester)
      .sort();
  }

  examinations(): {semester: Semester, date: string}[] {
    const history = this.props.module.History;
    if (!history) return [];
    return history
      .filter(h => h.ExamDate != null)
      .sort((a, b) => a.Semester - b.Semester)
      .map(h => ({ semester: h.Semester, date: h.ExamDate || '' }));
  }

  moduleHasBeenAdded(module: Module, semester: Semester): boolean {
    const timetables = this.props.timetables;
    return timetables[semester] && !!timetables[semester][module.ModuleCode];
  }

  render() {
    const { module } = this.props;
    const { ModuleCode, ModuleTitle } = module;

    return (
      <div className="module-container page-container">
        <Helmet>
          <title>{ModuleCode} {ModuleTitle} - {config.brandName}</title>
        </Helmet>

        <div className="row">
          <div className="col-md-9">
            <header>
              <h1 className="page-title">
                <span className="page-title-module-code">{ModuleCode}</span>
                {ModuleTitle}
              </h1>

              <p>
                {intersperse([
                  <a key="department">{module.Department}</a>,
                  <a key="mc">{module.ModuleCredit} MCs</a>,
                ], BULLET)}
              </p>

              <p>
                {intersperse(this.semestersOffered().map(semester => (
                  <a key={semester}>{ config.semesterNames[semester] }</a>
                )), BULLET)}
              </p>
            </header>

            <ScrollItem menuId={MENU_ID} label="Details" topOffset={TOP_OFFSET} className="row">
              <div className="col-sm-8">
                { module.ModuleDescription && <p>{module.ModuleDescription}</p> }

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

              <div className="col-sm-4 module-page-sidebar">
                {this.examinations().map(exam => (
                  <div key={`exam-${exam.semester}`}>
                    <h3>{config.semesterNames[exam.semester]} Exam</h3>
                    <p>{formatExamDate(exam.date)}</p>
                  </div>
                ))}

                <div>
                  {this.semestersOffered().map(
                    semester => (
                      this.moduleHasBeenAdded(module, semester) ?
                        <button
                          key={semester}
                          className="btn btn-outline-primary"
                          onClick={() => this.props.removeModule(semester, ModuleCode)}
                        >
                          Remove from {config.semesterNames[semester]}
                        </button>
                        :
                        <button
                          key={semester}
                          className="btn btn-outline-primary"
                          onClick={() => this.props.addModule(semester, ModuleCode)}
                        >
                          Add to {config.semesterNames[semester]}
                        </button>
                    ),
                  )}
                </div>

                <div>
                  <h3>Official Links</h3>
                  {intersperse([
                    <a key="ivle" href={config.ivleUrl.replace('<ModuleCode>', ModuleCode)}>IVLE</a>,
                    <a key="cors" href={config.corsUrl + ModuleCode}>CORS</a>,
                  ], BULLET)}
                </div>
              </div>
            </ScrollItem>

            <ScrollItem menuId={MENU_ID} topOffset={TOP_OFFSET} label="Prerequisites">
              <h2>Prerequisite Tree</h2>

            </ScrollItem>

            {module.CorsBiddingStats && <ScrollItem menuId={MENU_ID} topOffset={TOP_OFFSET} label="Bidding Stats">
              <h2>CORS Bidding Stats</h2>
              <CorsBiddingStatsTableControl stats={module.CorsBiddingStats} />
            </ScrollItem>}

            <ScrollItem menuId={MENU_ID} topOffset={TOP_OFFSET} label="Timetable">
              <h2>Timetable</h2>
              <LessonTimetable
                semestersOffered={this.semestersOffered()}
                history={module.History}
              />
            </ScrollItem>

            <ScrollItem menuId={MENU_ID} label="Reviews">
              <h2>Review and Discussion</h2>
            </ScrollItem>
          </div>

          <aside className="col-md-3">
            <nav className="module-side-menu">
              <ScrollMenu menuId={MENU_ID} />
            </nav>
          </aside>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  timetables: state.timetables,
  module: state.entities.moduleBank.modules[ownProps.moduleCode],
});

export default connect(mapStateToProps, { addModule, removeModule })(ModulePageContentComponent);
