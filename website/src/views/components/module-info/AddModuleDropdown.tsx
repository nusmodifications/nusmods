import { PureComponent } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';

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

  state: State = {
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

  render() {
    const { block, className, module } = this.props;

    const defaultSemester = getFirstAvailableSemester(module.semesterData);
    const otherSemesters = this.otherSemesters(defaultSemester);
    const id = `add-to-timetable-${module.moduleCode}`;

    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <Downshift>
        {({ getLabelProps, getItemProps, isOpen, toggleMenu, highlightedIndex, getMenuProps }) => (
          <div>
            <label {...getLabelProps({ htmlFor: id })} className="sr-only">
              Add module to timetable
            </label>

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

              {!!otherSemesters.length && (
                <>
                  <button
                    id={id}
                    type="button"
                    className="btn btn-outline-primary dropdown-toggle dropdown-toggle-split"
                    onClick={() => toggleMenu()}
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                  >
                    <span className="sr-only">Toggle Dropdown</span>
                  </button>

                  <div
                    className={classnames('dropdown-menu', { show: isOpen })}
                    {...getMenuProps()}
                  >
                    {otherSemesters.map((semester, index) => (
                      <button
                        {...getItemProps({ item: semester })}
                        type="button"
                        key={semester}
                        className={classnames('dropdown-item', {
                          'dropdown-selected': index === highlightedIndex,
                        })}
                        onClick={() => this.onSelect(semester)}
                      >
                        <span className={styles.dropdownItemContents}>
                          {this.buttonLabel(semester)}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Downshift>
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
