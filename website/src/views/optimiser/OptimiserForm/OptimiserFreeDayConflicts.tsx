import { isEmpty } from 'lodash';
import { FreeDayConflict } from 'types/optimiser';

import { X } from 'react-feather';
import styles from './OptimiserFreeDayConflicts.scss';

type Props = {
  freeDayConflicts: FreeDayConflict[];
};

const OptimiserFreeDayConflicts: React.FC<Props> = ({ freeDayConflicts }) =>
  !isEmpty(freeDayConflicts) && (
    <div className={styles.conflictWarning}>
      <div className={styles.conflictHeader}>
        <X size={20} />
        Free Day Conflicts
      </div>

      <div className={styles.conflictDescription}>
        The following lessons require physical attendance on your selected free days:
      </div>

      {freeDayConflicts.map((conflict, index) => (
        <div key={index} className={styles.conflictItem}>
          • <strong>{conflict.displayText}</strong>
          cannot be assigned due to your free days: {conflict.days.join(', ')}
        </div>
      ))}

      <div className={styles.conflictFooter}>
        Consider disabling live attendance for these lessons or selecting different free days.
      </div>
    </div>
  );

export default OptimiserFreeDayConflicts;
