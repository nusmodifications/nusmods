import { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { Module, ModuleCode, Semester } from 'types/modules';
import { TimetableConfig } from 'types/timetables';

import { addModule, removeModule } from 'actions/timetables';
import { getFirstAvailableSemester } from 'utils/modules';
import { State as StoreState } from 'types/state';

import styles from './SaveModuleButton.scss';

type Props = {
  module: Module;
  timetables: TimetableConfig;
  className?: string;
  block?: boolean;

  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  removeModule: (semester: Semester, moduleCode: ModuleCode) => void;
};

type State = {
  loading: Semester | null;
};

function isModuleOnTimetable(
  semester: Semester,
  timetables: TimetableConfig,
  module: Module,
): boolean {
  return !!get(timetables, [String(semester), module.moduleCode]);
}

export class SaveModuleButtonComponent extends PureComponent<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { timetables, module } = nextProps;
    const { loading } = prevState;

    if (loading != null && isModuleOnTimetable(loading, timetables, module)) {
      return { loading: null };
    }

    return null;
  }

  override state: State = {
    loading: null,
  };

  // TODO: Link addPlannerModule and removePlannerModule functions to the button
  onSelect(semester: Semester) {
    const { module, timetables } = this.props;

    if (isModuleOnTimetable(semester, timetables, module)) {
      this.props.removeModule(semester, module.moduleCode);
    } else {
      this.setState({ loading: semester });
      this.props.addModule(semester, module.moduleCode);
    }
  }

  buttonLabel(semester: Semester) {
    const hasModule = isModuleOnTimetable(semester, this.props.timetables, this.props.module);
    return hasModule ? (
      <>
        Remove from <br />
        <strong>Plan To Take</strong>
      </>
    ) : (
      <>
        Add to <br />
        <strong>Plan To Take</strong>
      </>
    );
  }

  override render() {
    const { block, className, module } = this.props;
    const defaultSemester = getFirstAvailableSemester(module.semesterData);
    // const id = `add-to-timetable-${module.moduleCode}`;

    return (
      <div
        className={classnames('btn-group', styles.buttonGroup, className, {
          'btn-block': block,
        })}
      >
        <button
          type="button"
          className={classnames('btn btn-outline-primary', {
            'btn-block': block,
          })}
          onClick={() => this.onSelect(defaultSemester)}
        >
          {this.buttonLabel(defaultSemester)}
        </button>
      </div>
    );
  }
}

// TODO: Link planToTake redux state to maptoprops, and wrap add/removeplannermodule
const SaveModuleButtonConnected = connect(
  (state: StoreState) => ({
    timetables: state.timetables.lessons,
  }),
  { addModule, removeModule },
)(SaveModuleButtonComponent);

export default SaveModuleButtonConnected;
