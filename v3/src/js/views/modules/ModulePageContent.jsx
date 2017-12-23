// @flow
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { connect, type MapStateToProps } from 'react-redux';
import Helmet from 'react-helmet';
import ScrollSpy from 'react-scrollspy';
import { map, mapValues, kebabCase, values } from 'lodash';

import type { Module, Semester } from 'types/modules';

import config from 'config';
import { formatExamDate, getSemestersOffered } from 'utils/modules';
import { intersperse } from 'utils/array';
import { BULLET } from 'utils/react';
import { NAVTAB_HEIGHT } from 'views/layout/Navtabs';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import DisqusComments from 'views/components/DisqusComments';
import Online from 'views/components/Online';
import Warning from 'views/errors/Warning';
import SideMenu from 'views/components/SideMenu';
import LessonTimetable from 'views/components/module-info/LessonTimetable';
import ModuleExamClash from 'views/components/module-info/ModuleExamClash';
import ModuleWorkload from 'views/components/module-info/ModuleWorkload';
import AddToTimetableDropdown from 'views/components/module-info/AddModuleDropdown';
import CorsStats from 'views/components/cors-stats/CorsStats';
import CorsNotification from 'views/components/cors-info/CorsNotification';

import styles from './ModulePageContent.scss';

type Props = {
  module: Module,
};

type State = {
  isMenuOpen: boolean,
};

export const SIDE_MENU_LABELS = {
  details: 'Details',
  // TODO: Remove this when the prerequisite tree is ready
  // prerequisites: 'Prerequisites',
  timetable: 'Timetable',
  cors: 'Bidding Stats',
  reviews: 'Reviews',
};

export const SIDE_MENU_ITEMS = mapValues(SIDE_MENU_LABELS, kebabCase);

export class ModulePageContentComponent extends Component<Props, State> {
  state: State = {
    isMenuOpen: false,
  };

  examinations(): {semester: Semester, date: string}[] {
    const history = this.props.module.History;
    if (!history) return [];
    return history
      .filter(h => h.ExamDate != null)
      .sort((a, b) => a.Semester - b.Semester)
      .map(h => ({ semester: h.Semester, date: h.ExamDate || '' }));
  }

  toggleMenu = (isMenuOpen: boolean) => this.setState({ isMenuOpen });

  render() {
    const { module } = this.props;
    const { ModuleCode, ModuleTitle } = module;

    const pageTitle = `${ModuleCode} ${ModuleTitle}`;
    const semesters = getSemestersOffered(module);

    return (
      <div className={classnames('page-container', styles.moduleInfoPage)}>
        <Helmet>
          <title>{pageTitle} - {config.brandName}</title>
        </Helmet>

        <CorsNotification />

        <div className="row">
          <div className="col-md-9">
            <div
              id={SIDE_MENU_ITEMS.details}
              className={classnames(styles.section, styles.firstSection)}
            >
              <header className={styles.header}>
                <h1 className={styles.pageTitle}>
                  <span className={styles.moduleCodeTitle}>{ModuleCode}</span>
                  {ModuleTitle}
                </h1>

                <p>
                  {intersperse([
                    <a key="department">{module.Department}</a>,
                    <a key="mc">{module.ModuleCredit} MCs</a>,
                  ], BULLET)}
                </p>

                <p>
                  {intersperse(semesters.map(semester => (
                    <a key={semester}>{ config.semesterNames[semester] }</a>
                  )), BULLET)}
                </p>
              </header>

              <section className={classnames('row', styles.details)}>
                <div className="col-sm-8">
                  {module.ModuleDescription && <p>{module.ModuleDescription}</p>}

                  <dl>
                    {module.Prerequisite &&
                      <Fragment>
                        <dt>Prerequisite</dt>
                        <dd>
                          <LinkModuleCodes>{module.Prerequisite}</LinkModuleCodes>
                        </dd>
                      </Fragment>}

                    {module.Corequisite &&
                      <Fragment>
                        <dt>Corequisite</dt>
                        <dd>
                          <LinkModuleCodes>{module.Corequisite}</LinkModuleCodes>
                        </dd>
                      </Fragment>}

                    {module.Preclusion &&
                      <Fragment>
                        <dt>Preclusion</dt>
                        <dd>
                          <LinkModuleCodes>{module.Preclusion}</LinkModuleCodes>
                        </dd>
                      </Fragment>}
                  </dl>

                  {module.Workload
                    ? <ModuleWorkload workload={module.Workload} />
                    :
                    <Fragment>
                      <h4>Workload</h4>
                      <p>Workload not available</p>
                    </Fragment>}
                </div>

                <div className="col-sm-4">
                  {this.examinations().map(exam => (
                    <div key={exam.semester} className={styles.exam}>
                      <h3 className={styles.descriptionHeading}>{config.semesterNames[exam.semester]} Exam</h3>
                      <p>{formatExamDate(exam.date)}</p>

                      <ModuleExamClash
                        semester={exam.semester}
                        examDate={exam.date}
                        moduleCode={ModuleCode}
                      />
                    </div>
                  ))}

                  <div className={styles.addToTimetable}>
                    <AddToTimetableDropdown
                      module={module}
                      className="btn-group-sm"
                      block
                    />
                  </div>

                  <div>
                    <h3 className={styles.descriptionHeading}>Official Links</h3>
                    {intersperse([
                      <a key="ivle" href={config.ivleUrl.replace('<ModuleCode>', ModuleCode)}>IVLE</a>,
                      <a key="cors" href={config.corsUrl + ModuleCode}>CORS</a>,
                    ], BULLET)}
                  </div>
                </div>
              </section>
            </div>

            {/* TODO: Add in prereq tree when it is ready
            <section className={styles.section} id={SIDE_MENU_ITEMS.prerequisites}>
              <h2 className={styles.sectionHeading}>Prerequisite Tree</h2>
            </section>
            */}

            <section className={styles.section} id="timetable">
              <h2 className={styles.sectionHeading}>Timetable</h2>
              <LessonTimetable
                semestersOffered={semesters}
                history={module.History}
              />
            </section>

            <section className={styles.section} id={SIDE_MENU_ITEMS.cors}>
              <h2 className={styles.sectionHeading}>CORS Bidding Stats</h2>
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

            <section className={styles.section} id={SIDE_MENU_ITEMS.reviews}>
              <h2 className={styles.sectionHeading}>Review and Discussion</h2>
              <Online isLive={false}>{isOnline => (
                isOnline ?
                  <div className="row">
                    <div className="col-xl-4">
                      <div className={classnames('alert alert-warning', styles.reviewsBanner)}>
                        <h3>Hi There!</h3>
                        <p>We would like to encourage everyone who enjoyed using NUSMods to
                          contribute back to the community by writing reviews for modules
                          that you have taken before. Your efforts will go a long way in
                          building up a vibrant and rich NUS community.</p>
                        <p><strong>Please note:</strong> Because the experience of each module
                          will differ according to the professor teaching the module, at the
                          start of your review, please state the semester taken and the name
                          of the professor who taught the module in that semester.</p>
                      </div>
                    </div>
                    <div className="col-xl-8 order-xl-first">
                      <DisqusComments
                        url={`https://nusmods.com/modules/${ModuleCode}/reviews`}
                        identifier={ModuleCode}
                        title={pageTitle}
                      />
                    </div>
                  </div>
                  :
                  <Warning
                    message="Comments not available while offline. Make sure you are
                             online and refresh to view comments."
                  />
              )}</Online>
            </section>
          </div>

          <aside className="col-md-3">
            <SideMenu
              isOpen={this.state.isMenuOpen}
              toggleMenu={this.toggleMenu}
            >
              <nav className={styles.sideMenu}>
                <ScrollSpy
                  items={values(SIDE_MENU_ITEMS)}
                  currentClassName={styles.activeMenuItem}
                  offset={-NAVTAB_HEIGHT}
                >
                  {map(SIDE_MENU_LABELS, (label, key) => (
                    <li key={label}>
                      <a
                        onClick={() => this.toggleMenu(false)}
                        href={`#${SIDE_MENU_ITEMS[key]}`}
                      >{label}</a>
                    </li>
                  ))}
                </ScrollSpy>
              </nav>
            </SideMenu>
          </aside>
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state, ownProps) => ({
  module: state.entities.moduleBank.modules[ownProps.moduleCode],
});

export default connect(mapStateToProps)(ModulePageContentComponent);
