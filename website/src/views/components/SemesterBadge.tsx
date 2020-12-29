import * as React from 'react';
import classnames from 'classnames';
import config from 'config';
import { Semester } from 'types/modules';
import styles from './SemesterBadge.scss';

/* eslint-disable no-useless-computed-key */
const BADGE_COLOR: { [semester: number]: string } = {
  [1]: styles.sem1,
  [2]: styles.sem2,
  [3]: styles.sem3,
  [4]: styles.sem4,
};
/* eslint-enable */

type Props = {
  className?: string;
  semesters: readonly Semester[];
};

const SemesterBadge: React.FC<Props> = ({ className, semesters }) => (
  <span className={classnames(className, styles.semesters)}>
    {semesters.map((semester) => (
      <span
        key={semester}
        className={classnames('badge', BADGE_COLOR[semester])}
        title={config.semesterNames[semester]}
        aria-label={config.semesterNames[semester]}
      >
        {config.shortSemesterNames[semester]}
      </span>
    ))}
  </span>
);

export default SemesterBadge;
