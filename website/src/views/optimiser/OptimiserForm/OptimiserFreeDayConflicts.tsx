import { isEmpty } from 'lodash';
import { FreeDayConflict } from 'types/optimiser';

import { X } from 'react-feather';
import styles from './OptimiserFreeDayConflicts.scss';

type Props = {
  freeDayConflicts: FreeDayConflict[];
};

const OptimiserFreeDayConflicts: React.FC<Props> = ({ freeDayConflicts }) =>
  !isEmpty(freeDayConflicts) && (
    <section className={styles.conflictWarning}>
      <h3>
        <X className="svg svg-med" />
        Free Day Conflicts
      </h3>

      <h4>The following lesson(s) require physical attendance on your selected free days:</h4>

      <ul>
        {freeDayConflicts.map((conflict, index) => (
          <li key={index}>
            <strong>{conflict.displayText}</strong> cannot be assigned due to your free days:{' '}
            {conflict.days.join(', ')}
          </li>
        ))}
      </ul>

      <h5>
        Consider disabling live attendance for these lessons or selecting different free days.
      </h5>
    </section>
  );

export default OptimiserFreeDayConflicts;
