import { isEmpty } from 'lodash-es';
import { PinnedClashConflict } from 'types/optimiser';

import { X } from 'react-feather';
import styles from './OptimiserConflicts.scss';

type Props = {
  pinnedClashConflicts: PinnedClashConflict[];
};

const OptimiserPinnedClashConflicts: React.FC<Props> = ({ pinnedClashConflicts }) =>
  !isEmpty(pinnedClashConflicts) && (
    <section className={styles.conflictWarning} role="alert">
      <h3>
        <X className="svg svg-med" />
        Pinned Class Clashes
      </h3>

      <h4>The following pinned classes clash with each other:</h4>

      <ul>
        {pinnedClashConflicts.map(({ first, second }) => (
          <li
            key={`${first.moduleCode}-${first.lessonType}-${second.moduleCode}-${second.lessonType}`}
          >
            <strong>{first.displayText}</strong> ({first.classNo}) clashes with{' '}
            <strong>{second.displayText}</strong> ({second.classNo})
          </li>
        ))}
      </ul>

      <h5>Consider unpinning one of these lessons, or changing its class in the timetable tab.</h5>
    </section>
  );

export default OptimiserPinnedClashConflicts;
