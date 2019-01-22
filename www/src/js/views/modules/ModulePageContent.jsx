// @flow
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import ScrollSpy from 'react-scrollspy';
import { kebabCase, map, mapValues, values } from 'lodash';

import type { Module } from 'types/modules';

import config from 'config';
import { formatExamDate, getSemestersOffered } from 'utils/modules';
import { intersperse } from 'utils/array';
import { BULLET } from 'utils/react';
import { NAVTAB_HEIGHT } from 'views/layout/Navtabs';
import ModuleTree from 'views/modules/ModuleTree';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import CommentCount from 'views/components/disqus/CommentCount';
import DisqusComments from 'views/components/disqus/DisqusComments';
import Online from 'views/components/Online';
import Warning from 'views/errors/Warning';
import SideMenu from 'views/components/SideMenu';
import LessonTimetable from 'views/components/module-info/LessonTimetable';
import ModuleExamClash from 'views/components/module-info/ModuleExamClash';
import ModuleWorkload from 'views/components/module-info/ModuleWorkload';
import AddModuleDropdown from 'views/components/module-info/AddModuleDropdown';
import Announcements from 'views/components/notfications/Announcements';
import Title from 'views/components/Title';
import ScrollToTop from 'views/components/ScrollToTop';
import { Archive } from 'views/components/icons';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import ExternalLink from 'views/components/ExternalLink';

import styles from './ModulePageContent.scss';

export type Props = {
  module: Module,
  archiveYear?: string,
};

type State = {
  isMenuOpen: boolean,
};

export const SIDE_MENU_LABELS = {
  details: 'Details',
  prerequisites: 'Prerequisites',
  timetable: 'Timetable',
  reviews: 'Reviews',
};

export const SIDE_MENU_ITEMS = mapValues(SIDE_MENU_LABELS, kebabCase);

export default class ModulePageContent extends Component<Props, State> {
  state: State = {
    isMenuOpen: false,
  };

  toggleMenu = (isMenuOpen: boolean) => this.setState({ isMenuOpen });

  render() {
    const { module, archiveYear } = this.props;
    const { ModuleCode, ModuleTitle } = module;

    const pageTitle = `${ModuleCode} ${ModuleTitle}`;
    const semesters = getSemestersOffered(module);
    const isArchive = !!archiveYear;

    const disqusConfig = {
      url: `https://nusmods.com/modules/${ModuleCode}/reviews`,
      identifier: ModuleCode,
      title: pageTitle,
    };

    return (
      <div className={classnames('page-container', styles.moduleInfoPage)}>
        <Title description={module.ModuleDescription}>{pageTitle}</Title>

        <Announcements />

        <ScrollToTop onComponentDidMount scrollToHash />

        {isArchive && (
          <div className={classnames(styles.archiveWarning, 'alert alert-warning')}>
            <Archive className={styles.archiveIcon} />
            <p>
              You are looking at archived information of this module from academic year{' '}
              <strong>{archiveYear}</strong>. Information on this page may be out of date.
            </p>
          </div>
        )}

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
                  {intersperse(
                    [
                      <span key="department">{module.Department}</span>,
                      <span key="mc">{module.ModuleCredit} MCs</span>,
                    ],
                    BULLET,
                  )}
                </p>

                <p>
                  {intersperse(
                    semesters.map((semester) => (
                      <span key={semester}>{config.semesterNames[semester]}</span>
                    )),
                    BULLET,
                  )}
                </p>
              </header>

              <section className={classnames('row', styles.details)}>
                <div className="col-sm-8">
                  {module.ModuleDescription && <p>{module.ModuleDescription}</p>}

                  <dl>
                    {module.Prerequisite && (
                      <Fragment>
                        <dt>Prerequisite</dt>
                        <dd>
                          <LinkModuleCodes>{module.Prerequisite}</LinkModuleCodes>
                        </dd>
                      </Fragment>
                    )}

                    {module.Corequisite && (
                      <Fragment>
                        <dt>Corequisite</dt>
                        <dd>
                          <LinkModuleCodes>{module.Corequisite}</LinkModuleCodes>
                        </dd>
                      </Fragment>
                    )}

                    {module.Preclusion && (
                      <Fragment>
                        <dt>Preclusion</dt>
                        <dd>
                          <LinkModuleCodes>{module.Preclusion}</LinkModuleCodes>
                        </dd>
                      </Fragment>
                    )}
                  </dl>

                  {module.Workload ? (
                    <ModuleWorkload workload={module.Workload} />
                  ) : (
                    <Fragment>
                      <h4>Workload</h4>
                      <p>Workload not available</p>
                    </Fragment>
                  )}
                </div>

                <div className="col-sm-4">
                  {module.History.sort((a, b) => a.Semester - b.Semester).map((semesterData) => (
                    <div key={semesterData.Semester} className={styles.exam}>
                      <h3 className={styles.descriptionHeading}>
                        {module.History.length > 1 && config.semesterNames[semesterData.Semester]}{' '}
                        Exam
                      </h3>
                      <p>{formatExamDate(semesterData.ExamDate)}</p>

                      <ModuleExamClash
                        semester={semesterData.Semester}
                        examDate={semesterData.ExamDate}
                        moduleCode={ModuleCode}
                      />
                    </div>
                  ))}

                  {!isArchive && (
                    <div className={styles.addToTimetable}>
                      <AddModuleDropdown module={module} className="btn-group-sm" block />
                    </div>
                  )}

                  <div>
                    <h3 className={styles.descriptionHeading}>Official Links</h3>
                    {intersperse(
                      [
                        <ExternalLink
                          key="ivle"
                          href={config.ivleUrl.replace('<ModuleCode>', ModuleCode)}
                        >
                          IVLE
                        </ExternalLink>,
                        <ExternalLink
                          key="cors"
                          href={config.corsUrl.replace('<ModuleCode>', ModuleCode)}
                        >
                          CORS
                        </ExternalLink>,
                      ],
                      BULLET,
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section className={styles.section} id={SIDE_MENU_ITEMS.prerequisites}>
              <h2 className={styles.sectionHeading}>Prerequisite Tree</h2>
              <ErrorBoundary>
                <ModuleTree module={module} />
              </ErrorBoundary>
            </section>

            <section className={styles.section} id="timetable">
              <h2 className={styles.sectionHeading}>Timetable</h2>
              <LessonTimetable semestersOffered={semesters} semesterData={module.History} />
            </section>

            <section className={styles.section} id={SIDE_MENU_ITEMS.reviews}>
              <h2 className={styles.sectionHeading}>Review and Discussion</h2>
              <Online isLive={false}>
                {(isOnline) =>
                  isOnline ? (
                    <div className="row">
                      <div className="col-xl-4">
                        <div className={classnames('alert alert-warning', styles.reviewsBanner)}>
                          <h3>Hi There!</h3>
                          <p>
                            We would like to encourage everyone who enjoyed using NUSMods to
                            contribute back to the community by writing reviews for modules that you
                            have taken before. Your efforts will go a long way in building up a
                            vibrant and rich NUS community.
                          </p>
                          <p>
                            <strong>Please note:</strong> Because the experience of each module will
                            differ according to the professor teaching the module, at the start of
                            your review, please state the semester taken and the name of the
                            professor who taught the module in that semester.
                          </p>
                        </div>
                      </div>
                      <div className="col-xl-8 order-xl-first">
                        <DisqusComments {...disqusConfig} />
                      </div>
                    </div>
                  ) : (
                    <Warning
                      message="Comments not available while offline. Make sure you are
                             online and refresh to view comments."
                    />
                  )
                }
              </Online>
            </section>
          </div>

          <aside className="col-md-3">
            <SideMenu isOpen={this.state.isMenuOpen} toggleMenu={this.toggleMenu}>
              <nav className={styles.sideMenu}>
                <ScrollSpy
                  items={values(SIDE_MENU_ITEMS)}
                  currentClassName={styles.activeMenuItem}
                  offset={-NAVTAB_HEIGHT}
                >
                  {map(SIDE_MENU_LABELS, (label, key) => (
                    <li key={label}>
                      <a onClick={() => this.toggleMenu(false)} href={`#${SIDE_MENU_ITEMS[key]}`}>
                        {label}
                        {key === 'reviews' && <CommentCount {...disqusConfig} />}
                      </a>
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
