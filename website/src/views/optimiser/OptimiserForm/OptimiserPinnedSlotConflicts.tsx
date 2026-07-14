import { isEmpty } from 'lodash-es';
import { PinnedSlotConflict } from 'types/optimiser';

import { AlertTriangle } from 'react-feather';
import styles from './OptimiserPinnedSlotConflicts.scss';

type Props = {
  pinnedSlotConflicts: PinnedSlotConflict[];
};

const OptimiserPinnedSlotConflicts: React.FC<Props> = ({ pinnedSlotConflicts }) =>
  !isEmpty(pinnedSlotConflicts) && (
    <section className={styles.conflictWarning} role="alert">
      <h3>
        <AlertTriangle className="svg svg-med" />
        Pinned Class Conflicts
      </h3>

      <h4>The following pinned class(es) clash with your other preferences:</h4>

      <ul>
        {pinnedSlotConflicts.map((conflict, index) => (
          <li key={index}>
            <strong>
              {conflict.displayText} ({conflict.classNo})
            </strong>{' '}
            {conflict.reasons.join(' and ')}
          </li>
        ))}
      </ul>

      <h5>Pinned classes are kept exactly as chosen; the optimiser will plan around them.</h5>
    </section>
  );

export default OptimiserPinnedSlotConflicts;
