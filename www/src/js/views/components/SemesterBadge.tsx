import * as React from 'react';
import classnames from 'classnames';
import config from 'config';
import { Semester } from 'types/modules';
import styles from './SemesterBadge.scss';

/* eslint-disable no-useless-computed-key */
const BADGE_COLOR = {
  [1]: styles.sem1,
  [2]: styles.sem2,
  [3]: styles.sem3,
  [4]: styles.sem4,
};
/* eslint-enable */

type Props = {
  className?: string;
  semesters: Semester[];
};

export default function(props: Props) {
  return (
    <span className={classnames(props.className, styles.semesters)}>
      {props.semesters.sort().map((semester) => (
        <span
          key={semester}
          className={classnames('badge', BADGE_COLOR[semester])}
          title={config.semesterNames[semester]}
        >
          {config.shortSemesterNames[semester]}
        </span>
      ))}
    </span>
  );
}
