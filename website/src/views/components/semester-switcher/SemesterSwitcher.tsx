import { Semester } from 'types/modules';

import * as React from 'react';
import config from 'config';

import { ChevronLeft, ChevronRight } from 'react-feather';

import { isValidSemester } from 'utils/timetables';

import styles from './SemesterSwitcher.scss';

type Props = {
  readOnly?: boolean;
  semester: Semester;
  onSelectSemester: Function;
};

class SemesterSwitcher extends React.PureComponent<Props> {
  switchSemester = (offset: number) => {
    const newSemester: Semester = this.props.semester + offset;
    if (!isValidSemester(newSemester)) {
      return;
    }
    this.props.onSelectSemester(newSemester);
  };

  render() {
    const { readOnly } = this.props;

    return (
      <div className={styles.semesterSwitcher}>
        {!readOnly && (
          <button
            className="btn btn-link"
            type="button"
            aria-label="Previous Semester"
            onClick={() => {
              this.switchSemester(-1);
            }}
            disabled={!isValidSemester(this.props.semester - 1)}
          >
            <ChevronLeft />
          </button>
        )}
        <span className="sr-only">Current semester:</span>
        <span className={styles.semesterName}>{config.semesterNames[this.props.semester]}</span>
        {!readOnly && (
          <button
            className="btn btn-link"
            type="button"
            aria-label="Next Semester"
            onClick={() => {
              this.switchSemester(1);
            }}
            disabled={!isValidSemester(this.props.semester + 1)}
          >
            <ChevronRight />
          </button>
        )}
      </div>
    );
  }
}

export default SemesterSwitcher;
