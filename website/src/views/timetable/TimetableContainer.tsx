import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import classnames from 'classnames';

import { ModuleCode, Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';
import { ColorMapping, ModulesMap, NotificationOptions } from 'types/reducers';

import { selectSemester } from 'actions/settings';
import { getSemesterTimetable } from 'selectors/timetables';
import { fetchTimetableModules, setTimetable } from 'actions/timetables';
import { openNotification } from 'actions/app';
import { undo } from 'actions/undoHistory';
import { getModuleCondensed } from 'selectors/moduleBank';
import { deserializeTimetable } from 'utils/timetables';
import { fillColorMapping } from 'utils/colors';
import { semesterForTimetablePage, TIMETABLE_SHARE, timetablePage } from 'views/routes/paths';
import deferComponentRender from 'views/hocs/deferComponentRender';
import { Repeat } from 'react-feather';
import SemesterSwitcher from 'views/components/semester-switcher/SemesterSwitcher';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ScrollToTop from 'views/components/ScrollToTop';
import { State as StoreState } from 'types/state';
import TimetableContent from './TimetableContent';

import styles from './TimetableContainer.scss';

export type QueryParam = {
  action: string;
  semester: string;
};

type OwnProps = RouteComponentProps<QueryParam>;

type Props = OwnProps & {
  modules: ModulesMap;
  semester: Semester | null;
  activeSemester: Semester;
  timetable: SemTimetableConfig;
  colors: ColorMapping;

  isValidModule: (moduleCode: ModuleCode) => boolean;
  selectSemester: (semester: Semester) => void;
  setTimetable: (
    semester: Semester,
    semTimetableConfig: SemTimetableConfig,
    colorMapping: ColorMapping,
  ) => void;
  fetchTimetableModules: (semTimetableConfig: SemTimetableConfig[]) => void;
  openNotification: (str: string, notificationOptions: NotificationOptions) => void;
  undo: () => void;
};

type State = {
  importedTimetable: SemTimetableConfig | null;
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

    const { semester, match, location } = props;
    const importedTimetable =
      semester && match.params.action ? deserializeTimetable(location.search) : null;

    this.state = {
      importedTimetable,
    };
  }

  componentDidMount() {
    if (this.state.importedTimetable) {
      this.props.fetchTimetableModules([this.state.importedTimetable]);
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
    // Check that all modules are fully loaded into the ModuleBank
    const { modules, timetable } = this.props;
    const { importedTimetable } = this.state;

    const moduleCodes = new Set(Object.keys(timetable));
    if (importedTimetable) {
      Object.keys(importedTimetable)
        .filter(this.props.isValidModule)
        .forEach((moduleCode) => moduleCodes.add(moduleCode));
    }

    // TODO: Account for loading error
    return Array.from(moduleCodes).some((moduleCode) => !modules[moduleCode]);
  }

  importTimetable(semester: Semester, timetable: SemTimetableConfig) {
    const colors = fillColorMapping(timetable, this.props.colors);
    this.props.setTimetable(semester, timetable, colors);
    this.clearImportedTimetable();

    this.props.openNotification('Timetable imported', {
      timeout: 12000,
      overwritable: true,
      action: {
        text: 'Undo',
        handler: this.props.undo,
      },
    });
  }

  clearImportedTimetable = () => {
    const { semester } = this.props;
    if (semester) {
      this.setState({ importedTimetable: null }, () =>
        this.props.history.push(timetablePage(semester)),
      );
    }
  };

  sharingHeader(semester: Semester, timetable: SemTimetableConfig) {
    return (
      <div className={classnames('alert', 'alert-success', styles.importAlert)}>
        <Repeat />

        <div className={classnames('row', styles.row)}>
          <div className={classnames('col')}>
            <h3>This timetable was shared with you</h3>
            <p>
              Clicking import will <strong>replace</strong> your saved timetable with the one below.
            </p>
          </div>

          <div className={classnames('col-md-auto', styles.actions)}>
            <button
              className="btn btn-success"
              type="button"
              onClick={() => this.importTimetable(semester, timetable)}
            >
              Import
            </button>
            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={this.clearImportedTimetable}
            >
              Back to saved timetable
            </button>
          </div>
        </div>
      </div>
    );
  }

  timetableHeader(semester: Semester, readOnly?: boolean) {
    return (
      <SemesterSwitcher
        semester={semester}
        onSelectSemester={this.selectSemester}
        readOnly={readOnly}
      />
    );
  }

  render() {
    const { timetable, semester, activeSemester, match } = this.props;
    const { importedTimetable } = this.state;
    const { action } = match.params;

    // 1. If the URL doesn't look correct, we'll direct the user to the home page
    if (semester == null || (action && action !== TIMETABLE_SHARE)) {
      return <Redirect to={timetablePage(activeSemester)} />;
    }

    // 2. If we are importing a timetable, check that all imported modules are
    //    loaded first, and display a spinner if they're not.
    if (this.isLoading()) {
      return <LoadingSpinner />;
    }

    // 3. Construct the color map
    const displayedTimetable = importedTimetable || timetable;
    const colors = fillColorMapping(displayedTimetable, this.props.colors);

    // 4. If there is an imported timetable, we show the sharing header which
    //    asks the user if they want to import the shared timetable
    const header = importedTimetable ? (
      <>
        {this.sharingHeader(semester, importedTimetable)}
        {this.timetableHeader(semester, true)}
      </>
    ) : (
      this.timetableHeader(semester)
    );

    return (
      <div>
        <ScrollToTop />

        <TimetableContent
          key={semester}
          semester={semester}
          timetable={displayedTimetable}
          colors={colors}
          header={header}
          readOnly={!!importedTimetable}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState, ownProps: OwnProps) => {
  const semester = semesterForTimetablePage(ownProps.match.params.semester);
  const { timetable, colors } = semester
    ? getSemesterTimetable(semester, state.timetables)
    : { timetable: {}, colors: {} };
  const getModule = getModuleCondensed(state.moduleBank);

  return {
    semester,
    timetable,
    colors,
    isValidModule: (moduleCode: ModuleCode) => !!getModule(moduleCode),
    modules: state.moduleBank.modules,
    activeSemester: state.app.activeSemester,
  };
};

// Explicitly declare top level components for React hot reloading to work.
const connectedTimetableContainer = connect(mapStateToProps, {
  selectSemester,
  setTimetable,
  fetchTimetableModules,
  openNotification,
  undo,
})(TimetableContainerComponent);

const routedTimetableContainer = withRouter(connectedTimetableContainer);
export default deferComponentRender(routedTimetableContainer);
