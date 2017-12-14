// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import ScrollSpy from 'react-scrollspy';
import classnames from 'classnames';

import type { Module, Semester } from 'types/modules';
import type { TimetableConfig } from 'types/timetables';

import config from 'config';
import { addModule, removeModule } from 'actions/timetables';
import { formatExamDate } from 'utils/modules';
import { intersperse } from 'utils/array';
import { BULLET } from 'utils/react';
import { Close, Menu } from 'views/components/icons';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import DisqusComments from 'views/components/DisqusComments';
import LessonTimetable from 'views/components/module-info/LessonTimetable';
import ModuleExamClash from 'views/components/module-info/ModuleExamClash';
import CorsStats from 'views/components/cors-stats/CorsStats';
import Fab from 'views/components/Fab';

import styles from './ModulePageContent.scss';

type Props = {
  module: Module,
  timetables: TimetableConfig,
  addModule: Function,
  removeModule: Function,
};

type State = {
  isMenuOpen: boolean,
}

class ModulePageContentComponent extends Component<Props, State> {
  state: State = {
    isMenuOpen: false,
  };

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
    const { isMenuOpen } = this.state;
    const { module } = this.props;
    const { ModuleCode, ModuleTitle } = module;

    const pageTitle = `${ModuleCode} ${ModuleTitle}`;

    return (
      <div className="module-container page-container">
        <Helmet>
          <title>{pageTitle} - {config.brandName}</title>
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

            <section id="details" className="row">
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
                  <div key={exam.semester} className={styles.exam}>
                    <h3>{config.semesterNames[exam.semester]} Exam</h3>
                    <p>{formatExamDate(exam.date)}</p>

                    <ModuleExamClash
                      semester={exam.semester}
                      examDate={exam.date}
                      moduleCode={ModuleCode}
                    />
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
            </section>

            <section id="prerequisites">
              <h2>Prerequisite Tree</h2>
              {/* TODO: Add in prereq tree when it is ready */}
            </section>

            <section id="timetable">
              <h2>Timetable</h2>
              <LessonTimetable
                semestersOffered={this.semestersOffered()}
                history={module.History}
              />
            </section>

            <section id="bidding-stats">
              <h2>CORS Bidding Stats</h2>
              {module.CorsBiddingStats ?
                <div>
                  <CorsStats stats={module.CorsBiddingStats} />
                </div>
                :
                <div>
                  No CORS bidding data available. This may be because the module is new,
                  or the module is not available from CORS.
                </div>}
            </section>

            <section id="reviews">
              <h2>Review and Discussion</h2>
              <DisqusComments
                url={`https://nusmods.com/modules/${ModuleCode}/reviews`}
                identifier={ModuleCode}
                title={pageTitle}
              />
            </section>
          </div>

          <aside className="col-md-3">
            <Fab
              className={styles.fab}
              onClick={() => this.setState({ isMenuOpen: !isMenuOpen })}
            >
              {isMenuOpen ? <Close aria-label="Close Menu" /> : <Menu aria-label="Open Menu" />}
            </Fab>

            <nav className={classnames(styles.sideMenu, { [styles.isOpen]: isMenuOpen })}>
              <ScrollSpy
                items={['details', 'prerequisites', 'bidding-stats', 'timetable', 'reviews']}
                currentClassName={styles.activeMenuItem}
              >
                <li><a href="#details">Details</a></li>
                <li><a href="#prerequisites">Prerequisites</a></li>
                <li><a href="#timetable">Timetable</a></li>
                <li><a href="#bidding-stats">Bidding Stats</a></li>
                <li><a href="#reviews">Reviews</a></li>
              </ScrollSpy>
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
