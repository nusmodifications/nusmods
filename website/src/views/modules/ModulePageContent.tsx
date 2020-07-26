import React from 'react';
import classnames from 'classnames';
import ScrollSpy from 'react-scrollspy';
import { kebabCase, map, mapValues, values, sortBy } from 'lodash';
import { hot } from 'react-hot-loader/root';

import { Module, NUSModuleAttributes, attributeDescription } from 'types/modules';

import config from 'config';
import { getSemestersOffered, isOffered, renderMCs } from 'utils/modules';
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
import ModuleExamInfo from 'views/components/module-info/ModuleExamInfo';
import AddModuleDropdown from 'views/components/module-info/AddModuleDropdown';
import Announcements from 'views/components/notfications/Announcements';
import Title from 'views/components/Title';
import ScrollToTop from 'views/components/ScrollToTop';
import { Archive, Check } from 'react-feather';
import ErrorBoundary from 'views/errors/ErrorBoundary';

import styles from './ModulePageContent.scss';
import ReportError from './ReportError';

export type Props = {
  module: Module;
  archiveYear?: string;
};

type State = {
  isMenuOpen: boolean;
};

export const SIDE_MENU_LABELS = {
  details: 'Details',
  prerequisites: 'Prerequisites',
  timetable: 'Timetable',
  reviews: 'Reviews',
};

export const SIDE_MENU_ITEMS = mapValues(SIDE_MENU_LABELS, kebabCase);

class ModulePageContent extends React.Component<Props, State> {
  state: State = {
    isMenuOpen: false,
  };

  toggleMenu = (isMenuOpen: boolean) => this.setState({ isMenuOpen });

  render() {
    const { module, archiveYear } = this.props;
    const { moduleCode, title } = module;

    const pageTitle = `${moduleCode} ${title}`;
    const semesters = getSemestersOffered(module);
    const isArchive = !!archiveYear;
    const offered = isOffered(module);

    const disqusConfig = {
      url: `https://nusmods.com/modules/${moduleCode}/reviews`,
      identifier: moduleCode,
      title: pageTitle,
    };

    const moduleCodes = [moduleCode];
    if (module.aliases) moduleCodes.push(...module.aliases);

    return (
      <div className={classnames('page-container', styles.moduleInfoPage)}>
        <Title description={module.description}>{pageTitle}</Title>

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

        {!offered && (
          <div className={classnames(styles.archiveWarning, 'alert alert-warning')}>
            <Archive className={styles.archiveIcon} />
            <p>
              This module is not offered in this academic year. You may use this information to map
              exchange modules or to see modules that were previously or may be offered in the
              future.
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
                  <span className={styles.moduleCodeTitle}>{moduleCodes.join('/')}</span>
                  {title}
                </h1>

                <p>
                  {intersperse(
                    [
                      <span key="department">{module.department}</span>,
                      <span key="faculty">{module.faculty}</span>,
                      <span key="mc">{renderMCs(module.moduleCredit)}</span>,
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
                  {module.description && <p>{module.description}</p>}

                  <dl>
                    {module.prerequisite && (
                      <>
                        <dt>Prerequisite</dt>
                        <dd>
                          <LinkModuleCodes>{module.prerequisite}</LinkModuleCodes>
                        </dd>
                      </>
                    )}

                    {module.corequisite && (
                      <>
                        <dt>Corequisite</dt>
                        <dd>
                          <LinkModuleCodes>{module.corequisite}</LinkModuleCodes>
                        </dd>
                      </>
                    )}

                    {module.preclusion && (
                      <>
                        <dt>Preclusion</dt>
                        <dd>
                          <LinkModuleCodes>{module.preclusion}</LinkModuleCodes>
                        </dd>
                      </>
                    )}

                    {module.attributes && (
                      <>
                        <dt>Additional Information</dt>
                        <dd>
                          <ul className={styles.attributes}>
                            {Object.keys(module.attributes).map((key) => (
                              <li key={key}>
                                <Check className={styles.checkmark} />{' '}
                                {attributeDescription[key as keyof NUSModuleAttributes]}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </>
                    )}
                  </dl>

                  {module.workload ? (
                    <ModuleWorkload workload={module.workload} />
                  ) : (
                    <>
                      <h4>Workload</h4>
                      <p>Workload not available</p>
                    </>
                  )}
                </div>

                <div className="col-sm-4">
                  {sortBy(module.semesterData, (semester) => semester.semester).map((semester) => (
                    <div key={semester.semester} className={styles.exam}>
                      <h3 className={styles.descriptionHeading}>
                        {module.semesterData.length > 1 && config.semesterNames[semester.semester]}{' '}
                        Exam
                      </h3>

                      <ModuleExamInfo semesterData={semester} />

                      <ModuleExamClash
                        semester={semester.semester}
                        examDate={semester.examDate}
                        moduleCode={moduleCode}
                      />
                    </div>
                  ))}

                  {!isArchive && offered && (
                    <div className={styles.addToTimetable}>
                      <AddModuleDropdown module={module} className="btn-group-sm" block />
                    </div>
                  )}

                  <p>
                    <ReportError module={module} />
                  </p>
                </div>
              </section>
            </div>

            <section className={styles.section} id={SIDE_MENU_ITEMS.prerequisites}>
              <h2 className={styles.sectionHeading}>Prerequisite Tree</h2>
              <ErrorBoundary>
                <ModuleTree
                  moduleCode={moduleCode}
                  prereqTree={module.prereqTree}
                  fulfillRequirements={module.fulfillRequirements}
                />
              </ErrorBoundary>
            </section>

            <section className={styles.section} id="timetable">
              <h2 className={styles.sectionHeading}>Timetable</h2>
              <LessonTimetable semesterData={module.semesterData} />
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
                          <strong>Please note:</strong>
                          <ol className={styles.modReviewDescription}>
                            <li>
                              Because the experience of each module will differ according to the
                              professor teaching the module, at the start of your review, please
                              state the semester taken and the name of the professor who taught the
                              module in that semester.
                            </li>
                            <li>
                              Other students will read your review to get an idea of what taking the
                              module will be like. If you'd like to give feedback about the module
                              to NUS, please use the official Student Feedback system as NUS does
                              not monitor these reviews.
                            </li>
                            <li>
                              The claims made in these reviews have not been verified by NUS or
                              NUSMods. Please take all claims with a grain of salt.
                            </li>
                          </ol>
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
                  {map(SIDE_MENU_LABELS, (label, key: keyof typeof SIDE_MENU_LABELS) => (
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

export default hot(ModulePageContent);
