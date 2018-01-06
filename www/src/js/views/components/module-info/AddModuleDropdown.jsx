// @flow

import React, { Fragment, PureComponent } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';

import type { Module, ModuleCode, Semester } from 'types/modules';
import type { TimetableConfig } from 'types/timetables';

import { addModule, removeModule } from 'actions/timetables';
import { getFirstAvailableSemester, getSemestersOffered } from 'utils/modules';
import config from 'config';

import styles from './AddModuleDropdown.scss';

type Props = {
  module: Module,
  timetables: TimetableConfig,
  className?: string,
  block?: boolean,

  addModule: (Semester, ModuleCode) => void,
  removeModule: (Semester, ModuleCode) => void,
};

type State = {
  loading: ?Semester,
};

export class AddModuleDropdownComponent extends PureComponent<Props, State> {
  state: State = {
    loading: null,
  };

  componentWillReceiveProps(nextProps: Props) {
    if (
      this.state.loading != null &&
      this.moduleOnTimetable(this.state.loading, nextProps.timetables)
    ) {
      this.setState({ loading: null });
    }
  }

  onSelect(semester: Semester) {
    const { module, timetables } = this.props;
    if (this.moduleOnTimetable(semester, timetables)) {
      this.props.removeModule(semester, module.ModuleCode);
    } else {
      this.setState({ loading: semester });
      this.props.addModule(semester, module.ModuleCode);
    }
  }

  buttonLabel(semester: Semester) {
    if (this.state.loading === semester) {
      return (
        <Fragment>
          Adding...<br />
          <strong>{config.semesterNames[semester]}</strong>
        </Fragment>
      );
    }

    return this.moduleOnTimetable(semester, this.props.timetables) ? (
      <Fragment>
        Remove from <br />
        <strong>{config.semesterNames[semester]}</strong>
      </Fragment>
    ) : (
      <Fragment>
        Add to <br />
        <strong>{config.semesterNames[semester]}</strong>
      </Fragment>
    );
  }

  otherSemesters(exclude: Semester): Semester[] {
    return getSemestersOffered(this.props.module)
      .filter((semester) => semester !== exclude)
      .sort();
  }

  moduleOnTimetable(semester: Semester, timetables: TimetableConfig): boolean {
    const { module } = this.props;
    return !!get(timetables, [String(semester), module.ModuleCode]);
  }

  render() {
    const { block, className, module } = this.props;

    const defaultSemester = getFirstAvailableSemester(module.History);
    const otherSemesters = this.otherSemesters(defaultSemester);
    const id = `add-to-timetable-${module.ModuleCode}`;

    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <Downshift>
        {({ getLabelProps, getItemProps, isOpen, toggleMenu, highlightedIndex }) => (
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
                <button
                  id={id}
                  type="button"
                  className="btn btn-outline-primary dropdown-toggle dropdown-toggle-split"
                  onClick={toggleMenu}
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                >
                  <span className="sr-only">Toggle Dropdown</span>
                </button>
              )}

              {isOpen && (
                <div className="dropdown-menu show">
                  {otherSemesters.map((semester, index) => (
                    <button
                      {...getItemProps({ item: semester })}
                      key={semester}
                      className={classnames('dropdown-item', styles.dropdownItem, {
                        'dropdown-selected': index === highlightedIndex,
                      })}
                      onClick={() => this.onSelect(semester)}
                    >
                      {this.buttonLabel(semester)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Downshift>
    );
  }
}

const AddModuleDropdownConnected = connect(
  (state) => ({
    timetables: state.timetables.timetableConfig,
  }),
  { addModule, removeModule },
)(AddModuleDropdownComponent);

export default AddModuleDropdownConnected;
