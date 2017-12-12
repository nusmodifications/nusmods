// @flow

import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import classnames from 'classnames';
import { connect } from 'react-redux';

import type { Module, ModuleCode, Semester } from 'types/modules';
import type { TimetableConfig } from 'types/timetables';

import { addModule, removeModule } from 'actions/timetables';
import { getFirstAvailableSemester } from 'utils/modules';
import config from 'config';

import styles from './AddToTimetable.scss';

type Props = {
  module: Module,
  timetables: TimetableConfig,
  className?: string,
  block?: boolean,

  addModule: (Semester, ModuleCode) => void,
  removeModule: (Semester, ModuleCode) => void,
};

export class AddToTimetableComponent extends PureComponent<Props> {
  onSelect(semester: Semester) {
    const { module } = this.props;
    const action = this.moduleHasBeenAdded(semester)
      ? this.props.removeModule
      : this.props.addModule;

    action(semester, module.ModuleCode);
  }

  buttonLabel(semester: Semester) {
    return this.moduleHasBeenAdded(semester)
      ? `Remove ${config.semesterNames[semester]}`
      : `Add to ${config.semesterNames[semester]}`;
  }

  moduleHasBeenAdded(semester: Semester): boolean {
    const { timetables } = this.props;
    return timetables[semester] && !!timetables[semester][this.props.module.ModuleCode];
  }

  otherSemesters(exclude: Semester): Semester[] {
    return this.props.module.History
      .map(h => h.Semester)
      .filter(semester => semester !== exclude)
      .sort();
  }

  render() {
    const { block, className, module } = this.props;

    const defaultSemester = getFirstAvailableSemester(module.History);
    const otherSemesters = this.otherSemesters(defaultSemester);
    const id = `add-to-timetable-${module.ModuleCode}`;

    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <Downshift>
        {({
          getLabelProps,
          getItemProps,
          isOpen,
          toggleMenu,
        }) => (
          <div>
            <label {...getLabelProps({ htmlFor: id })} className="sr-only">
              Add module to timetable
            </label>

            <div
              className={classnames('btn-group', styles.button, className, {
                'btn-block': block,
              })}
            >
              <button
                type="button"
                className={classnames('btn btn-primary', {
                  'btn-block': block,
                })}
                onClick={() => this.onSelect(defaultSemester)}
              >
                {this.buttonLabel(defaultSemester)}
              </button>

              {!!otherSemesters.length &&
                <button
                  id={id}
                  type="button"
                  className="btn btn-primary dropdown-toggle dropdown-toggle-split"
                  onClick={toggleMenu}
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                >
                  <span className="sr-only">Toggle Dropdown</span>
                </button>}

              {isOpen &&
                <div className="dropdown-menu show">
                  {otherSemesters.map(semester => (
                    <button
                      {...getItemProps({ item: semester })}
                      key={semester}
                      className="dropdown-item"
                      onClick={() => this.onSelect(semester)}
                    >
                      {this.buttonLabel(semester)}
                    </button>
                  ))}
                </div>}
            </div>
          </div>
        )}
      </Downshift>
    );
  }
}

export default connect(state => ({
  timetables: state.timetables,
}), { addModule, removeModule })(AddToTimetableComponent);
