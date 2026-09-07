import { Button } from 'components/ui/button';
import { memo } from 'react';
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

const SemesterSwitcher = memo<Props>(({ readOnly, semester, onSelectSemester }) => {
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
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Previous Semester"
          onClick={() => {
            switchSemester(-1);
          }}
          disabled={!isValidSemester(semester - 1)}
        >
          <ChevronLeft />
        </Button>
      )}
      <span className="sr-only">Current semester:</span>
      <span className={styles.semesterName}>{config.semesterNames[semester]}</span>
      {!readOnly && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Next Semester"
          onClick={() => {
            switchSemester(1);
          }}
          disabled={!isValidSemester(semester + 1)}
        >
          <ChevronRight />
        </Button>
      )}
    </div>
  );
});

export default SemesterSwitcher;
