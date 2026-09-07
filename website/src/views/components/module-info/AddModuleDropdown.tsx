import { Button } from 'components/ui/button';
import { PureComponent } from 'react';
import { ChevronDown } from 'react-feather';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'components/ui/dropdown-menu';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash-es';

import { Module, ModuleCode, Semester } from 'types/modules';
import { TimetableConfig } from 'types/timetables';

import { addModule, removeModule } from 'actions/timetables';
import { getFirstAvailableSemester, getSemestersOffered } from 'utils/modules';
import config from 'config';
import { State as StoreState } from 'types/state';

import styles from './AddModuleDropdown.scss';

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

export class AddModuleDropdownComponent extends PureComponent<Props, State> {
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
    if (this.state.loading === semester) {
      return 'Adding...';
    }

    const hasModule = isModuleOnTimetable(semester, this.props.timetables, this.props.module);
    return hasModule ? (
      <>
        Remove from <br />
        <strong>{config.semesterNames[semester]}</strong>
      </>
    ) : (
      <>
        Add to <br />
        <strong>{config.semesterNames[semester]}</strong>
      </>
    );
  }

  otherSemesters(exclude: Semester): Semester[] {
    return getSemestersOffered(this.props.module)
      .filter((semester) => semester !== exclude)
      .sort();
  }

  override render() {
    const { block, className, module } = this.props;

    const defaultSemester = getFirstAvailableSemester(module.semesterData);
    const otherSemesters = this.otherSemesters(defaultSemester);
    const id = `add-to-timetable-${module.moduleCode}`;

    return (
      <div
        className={classnames(styles.buttonGroup, className, {
          [styles.block]: block,
        })}
      >
        <Button
          type="button"
          variant="outline"
          className={classnames({ [styles.block]: block })}
          onClick={() => this.onSelect(defaultSemester)}
        >
          <span>{this.buttonLabel(defaultSemester)}</span>
        </Button>

        {!!otherSemesters.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id={id} type="button" variant="outline" className={styles.dropdownTrigger}>
                <ChevronDown aria-hidden="true" />
                <span className="sr-only">Toggle Dropdown</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" aria-label="Add course to timetable">
              {otherSemesters.map((semester) => (
                <DropdownMenuItem
                  key={semester}
                  className={styles.dropdownItem}
                  onSelect={() => this.onSelect(semester)}
                >
                  <span>{this.buttonLabel(semester)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }
}

const AddModuleDropdownConnected = connect(
  (state: StoreState) => ({
    timetables: state.timetables.lessons,
  }),
  { addModule, removeModule },
)(AddModuleDropdownComponent);

export default AddModuleDropdownConnected;
