// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect, type ContextRouter } from 'react-router-dom';
import classnames from 'classnames';
import { size } from 'lodash';

import type { Semester, ModuleCode } from 'types/modules';
import type { SemTimetableConfig } from 'types/timetables';
import type { ColorMapping } from 'types/reducers';
import type { ModulesMap } from 'reducers/entities/moduleBank';

import { selectSemester } from 'actions/settings';
import { setTimetable } from 'actions/timetables';
import { fetchModule } from 'actions/moduleBank';
import { getSemesterModules, deserializeTimetable } from 'utils/timetables';
import { fillColorMapping } from 'utils/colors';
import { semesterForTimetablePage, timetablePage, TIMETABLE_SHARE } from 'views/routes/paths';
import { Repeat } from 'views/components/icons';
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
  colors: ColorMapping,

  selectSemester: (Semester) => void,
  setTimetable: (Semester, SemTimetableConfig, ColorMapping) => Promise<*>,
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

  importTimetable(semester: Semester, timetable: SemTimetableConfig) {
    const colors = fillColorMapping(timetable, this.props.colors);
    this.props.setTimetable(semester, timetable, colors)
      .then(this.afterImport);
  }

  afterImport = () => {
    const { semester } = this.props;
    if (semester) {
      this.setState({ importedTimetable: null },
        () => this.props.history.push(timetablePage(semester)));
    }
  };

  sharingHeader(semester: Semester, timetable: SemTimetableConfig) {
    return (
      <div className={classnames('alert', 'alert-success', styles.importAlert)}>
        <Repeat />

        <div className="row justify-content-between">
          <div className="col-auto">
            <h3>This timetable was shared with you</h3>
            <p>Clicking import will <strong>replace</strong> your saved timetable with
              the one below.</p>
          </div>

          <div className={classnames('col-auto', styles.actions)}>
            <button
              className="btn btn-success"
              type="button"
              onClick={() => this.importTimetable(semester, timetable)}
            >
              Import shared timetable
            </button>

            <button
              className="btn btn-link"
              type="button"
              onClick={this.afterImport}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  timetableHeader(semester: Semester) {
    return (
      <SemesterSwitcher
        semester={semester}
        onSelectSemester={this.selectSemester}
      />
    );
  }

  render() {
    const { timetable, semester, activeSemester, match } = this.props;
    const { importedTimetable } = this.state;
    const action = match.params.action;

    // 1. Redirect to activeSemester if no semester was given in the URL. We do
    //    not check against props.semester because that may be null due to the
    //    semester being invalid (and not because the param was not provided)
    if (!match.params.semester) {
      return <Redirect to={timetablePage(activeSemester)} />;
    }

    // 2. If the semester is null or the action is not recognized, then the URL
    //    is invalid, so we display a 404 page
    if (semester == null || (action && action !== TIMETABLE_SHARE)) {
      return <NotFoundPage />;
    }

    // 3. If we are importing a timetable, check that all imported modules are
    //    loaded first, and display a spinner if they're not.
    if (this.isLoading()) {
      return <LoadingSpinner />;
    }

    // 4. Construct the color map
    const displayedTimetable = importedTimetable || timetable;
    const colors = fillColorMapping(displayedTimetable, this.props.colors);

    // 5. If there is an imported timetable, we show the sharing header which
    //    asks the user if they want to import the shared timetable
    const header = importedTimetable
      ? this.sharingHeader(semester, importedTimetable)
      : this.timetableHeader(semester);

    return (
      <TimetableContent
        semester={semester}
        timetable={displayedTimetable}
        colors={colors}
        header={header}
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
    colors: state.theme.colors,
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
