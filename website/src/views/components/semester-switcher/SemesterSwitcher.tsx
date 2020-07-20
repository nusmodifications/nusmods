import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';

import type { Semester } from 'types/modules';
import { isValidSemester } from 'utils/timetables';
import config from 'config';

import styles from './SemesterSwitcher.scss';

type Props = {
  readOnly?: boolean;
  semester: Semester;
  onSelectSemester: (newSemester: Semester) => void;
};

const SemesterSwitcher = React.memo<Props>(({ readOnly, semester, onSelectSemester }) => {
  const switchSemester = (offset: number) => {
    const newSemester: Semester = semester + offset;
    if (!isValidSemester(newSemester)) {
      return;
    }
    onSelectSemester(newSemester);
  };

  return (
    <div className={styles.semesterSwitcher}>
      {!readOnly && (
        <button
          className="btn btn-link"
          type="button"
          aria-label="Previous Semester"
          onClick={() => {
            switchSemester(-1);
          }}
          disabled={!isValidSemester(semester - 1)}
        >
          <ChevronLeft />
        </button>
      )}
      <span className="sr-only">Current semester:</span>
      <span className={styles.semesterName}>{config.semesterNames[semester]}</span>
      {!readOnly && (
        <button
          className="btn btn-link"
          type="button"
          aria-label="Next Semester"
          onClick={() => {
            switchSemester(1);
          }}
          disabled={!isValidSemester(semester + 1)}
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
});

export default SemesterSwitcher;
