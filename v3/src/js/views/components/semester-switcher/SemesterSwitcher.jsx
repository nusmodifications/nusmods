// @flow
import type { Semester } from 'types/modules';

import React, { Component } from 'react';
import config from 'config';

import { ChevronLeft, ChevronRight } from 'views/components/icons';

import { isValidSemester } from 'utils/timetables';

import styles from './SemesterSwitcher.scss';

type Props = {
  semester: Semester,
  onSelectSemester: Function,
};

class SemesterSwitcher extends Component<Props> {
  switchSemester = (offset: number) => {
    const newSemester: Semester = this.props.semester + offset;
    if (!isValidSemester(newSemester)) {
      return;
    }
    this.props.onSelectSemester(newSemester);
  }

  render() {
    return (
      <div>
        <h4 className="text-center">
          <button
            className="btn btn-link"
            type="button"
            onClick={() => {
              this.switchSemester(-1);
            }}
            disabled={!isValidSemester(this.props.semester - 1)}
          >
            <ChevronLeft />
          </button>
          <span className={styles.semesterName}>
            {config.semesterNames[this.props.semester]}
          </span>
          <button
            className="btn btn-link"
            type="button"
            onClick={() => {
              this.switchSemester(1);
            }}
            disabled={!isValidSemester(this.props.semester + 1)}
          >
            <ChevronRight />
          </button>
        </h4>
      </div>
    );
  }
}

export default SemesterSwitcher;
