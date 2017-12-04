// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect, type ContextRouter } from 'react-router-dom';
import { isEmpty, difference } from 'lodash';

import type { Semester, ModuleCode } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';

import { selectSemester } from 'actions/settings';
import { setTimetable } from 'actions/timetables';
import { fetchModule } from 'actions/moduleBank';
import { serializeTimetable, deserializeTimetable, isSameTimetableConfig } from 'utils/timetables';
import { semesterForTimetablePage, timetablePage } from 'views/routes/paths';
import NotFoundPage from 'views/errors/NotFoundPage';
import SemesterSwitcher from 'views/components/semester-switcher/SemesterSwitcher';
import TimetableContent from './TimetableContent';

const EMPTY_OBJECT = {};

type Props = {
  ...ContextRouter,

  semester: ?Semester,
  activeSemester: Semester,
  timetable: ?SemTimetableConfig,

  selectSemester: (Semester) => void,
  setTimetable: (Semester, SemTimetableConfig) => void,
  fetchModule: (ModuleCode) => void,
};

/**
 * Manages the semester and deconflicts stored timetable with imported timetable.
 *
 * - Checks if the semester path param is valid and display a 404 page if it is not
 * - Import timetable data from query string if there's no existing timetable
 * - Update query string when the timetable changes
 */
export class TimetableContainerComponent extends PureComponent<Props> {
  importedTimetable: ?SemTimetableConfig;

  componentDidMount() {
    const { timetable, semester } = this.props;
    if (semester == null || !timetable) return;

    const importedTimetable = deserializeTimetable(this.props.location.search);

    if (!isEmpty(importedTimetable)) {
      if (isEmpty(timetable)) {
        // If there's no existing timetable, we do a clean import
        this.props.setTimetable(semester, importedTimetable);
      } else if (!isSameTimetableConfig(timetable, importedTimetable)) {
        this.importedTimetable = importedTimetable;

        // If there is an existing timetable, and it doesn't match the imported one, we
        // check with the user if they want to import
        difference(Object.keys(timetable), Object.keys(importedTimetable))
          .forEach(moduleCode => this.props.fetchModule(moduleCode));

        // TODO: Actually show the dialog box
      }
    }

    if (!this.importedTimetable) {
      this.updateQueryString(timetable);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { timetable, semester } = nextProps;
    if (semester != null && timetable) {
      this.updateQueryString(timetable);
    }
  }

  timetableHeader(semester: Semester) {
    return (
      <SemesterSwitcher
        semester={semester}
        onSelectSemester={this.selectSemester}
      />
    );
  }

  selectSemester = (semester: Semester) => {
    this.props.selectSemester(semester);

    this.props.history.push({
      ...this.props.history.location,
      pathname: timetablePage(semester),
    });
  };

  updateQueryString(timetable: SemTimetableConfig) {
    const queryTimetable = deserializeTimetable(this.props.location.search);

    if (!isSameTimetableConfig(queryTimetable, timetable)) {
      this.props.history.replace({
        ...this.props.history.location,
        search: serializeTimetable(timetable),
      });
    }
  }

  render() {
    const { timetable, semester, activeSemester, match } = this.props;

    // Redirect to activeSemester if no semester was given in the URL
    if (!match.params.semester) {
      return <Redirect to={timetablePage(activeSemester)} />;
    }

    // Otherwise if the semester is null, then the semester is invalid, so we
    // display the 404 error page
    if (semester == null || !timetable) {
      return <NotFoundPage />;
    }

    return (
      <TimetableContent
        semester={semester}
        timetable={timetable}
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
