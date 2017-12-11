// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect, type ContextRouter } from 'react-router-dom';
import classnames from 'classnames';
import { size } from 'lodash';

import type { Semester, ModuleCode } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';
import type { ModulesMap } from 'reducers/entities/moduleBank';

import { selectSemester } from 'actions/settings';
import { setTimetable } from 'actions/timetables';
import { fetchModule } from 'actions/moduleBank';
import { getSemesterModules, deserializeTimetable } from 'utils/timetables';
import { TIMETABLE_SYNC, TIMETABLE_SHARE } from 'types/views';
import { semesterForTimetablePage, timetablePage } from 'views/routes/paths';
import { Repeat, Share } from 'views/components/icons';
import NotFoundPage from 'views/errors/NotFoundPage';
import SemesterSwitcher from 'views/components/semester-switcher/SemesterSwitcher';
import LoadingSpinner from 'views/components/LoadingSpinner';
import TimetableContent from './TimetableContent';
import styles from './TimetableContainer.scss';

const EMPTY_OBJECT = {};

type Props = {
  ...ContextRouter,

  modules: ModulesMap,
  semester: ?Semester,
  activeSemester: Semester,
  timetable: SemTimetableConfig,

  selectSemester: (Semester) => void,
  setTimetable: (Semester, SemTimetableConfig) => Promise<*>,
  fetchModule: (ModuleCode) => void,
};

type State = {
  importedTimetable: ?SemTimetableConfig,
};

/**
 * Manages semester switching and sync/shared timetables
 * - Checks if the semester path param is valid and display a 404 page if it is not
 * - Import timetable data from query string if action is defined
 * - Create the UI for the user to confirm their actions
 */
export class TimetableContainerComponent extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { semester, match } = props;
    const action = match.params.action;
    const importedTimetable = (semester && action) ? deserializeTimetable(this.props.location.search) : null;

    this.state = {
      importedTimetable,
    };
  }

  componentWillMount() {
    if (this.state.importedTimetable) {
      Object.keys(this.state.importedTimetable)
        .forEach(this.props.fetchModule);
    }
  }

  selectSemester = (semester: Semester) => {
    this.props.selectSemester(semester);

    this.props.history.push({
      ...this.props.history.location,
      pathname: timetablePage(semester),
    });
  };

  isLoading() {
    const { importedTimetable } = this.state;
    if (!importedTimetable) return false;

    // TODO: Account for loading error
    const loadedModules = getSemesterModules(importedTimetable, this.props.modules);
    return loadedModules.length < size(importedTimetable);
  }

  displayedTimetable() {
    return this.state.importedTimetable || this.props.timetable;
  }

  afterImport = () => {
    if (this.props.semester) {
      this.props.history.push(timetablePage(this.props.semester));
    }
  };

  timetableHeader(semester: Semester) {
    const { importedTimetable } = this.state;

    if (importedTimetable) {
      const action = this.props.match.params.action;

      if (action === TIMETABLE_SYNC) {
        return (
          <div className={classnames('alert', 'alert-success', styles.importAlert)}>
            <Repeat />

            <div className="row">
              <div className="col-md-7">
                <h3>Syncing your timetable</h3>
                <p>This will replace your saved timetable with the one below.</p>
              </div>

              <div className={classnames('col-md-5', styles.actions)}>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    this.props.setTimetable(semester, importedTimetable)
                      .then(this.afterImport);
                  }}
                >Replace</button>

                <button
                  className="btn btn-link"
                  onClick={this.afterImport}
                >Cancel</button>
              </div>
            </div>
          </div>
        );
      }

      if (action === TIMETABLE_SHARE) {
        return (
          <div className={classnames('alert', 'alert-info', styles.importAlert)}>
            <Share />

            <div className="row">
              <div className="col-md-7">
                <h3>Viewing a shared timetable</h3>
                <p>You&apos;re looking at a timetable that was shared with you.</p>
              </div>

              <div className={classnames('col-md-5', styles.actions)}>
                <button
                  className="btn btn-info"
                  onClick={this.afterImport}
                >
                  View my timetable
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <SemesterSwitcher
        semester={semester}
        onSelectSemester={this.selectSemester}
      />
    );
  }

  render() {
    const { semester, activeSemester, match } = this.props;
    const action = match.params.action;

    // 1. Redirect to activeSemester if no semester was given in the URL. We do
    //    not check against props.semester because that may be null due to the
    //    semester being invalid (and not because the param was not provided)
    if (!match.params.semester) {
      return <Redirect to={timetablePage(activeSemester)} />;
    }

    // 2. If the semester is null or the action is not recognized, then the URL
    //    is invalid, so we display a 404 page
    if (semester == null || (action && action !== TIMETABLE_SYNC && action !== TIMETABLE_SHARE)) {
      return <NotFoundPage />;
    }

    // 3. If we are importing a timetable, check that all imported modules are
    //    loaded first, and display a spinner if they're not
    if (this.isLoading()) {
      return <LoadingSpinner />;
    }

    return (
      <TimetableContent
        semester={semester}
        timetable={this.displayedTimetable()}
        header={this.timetableHeader(semester)}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const semester = semesterForTimetablePage(ownProps.match.params.semester);
  const timetable = state.timetables[semester] || EMPTY_OBJECT;

  return {
    semester,
    timetable,
    modules: state.entities.moduleBank.modules,
    activeSemester: state.app.activeSemester,
  };
};

export default withRouter(
  connect(mapStateToProps, {
    selectSemester,
    setTimetable,
    fetchModule,
  })(TimetableContainerComponent),
);
