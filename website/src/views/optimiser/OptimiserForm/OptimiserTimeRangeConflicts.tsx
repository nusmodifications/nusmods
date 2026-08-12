import { isEmpty } from 'lodash-es';
import { TimeRange, TimeRangeConflict } from 'types/optimiser';

import { X } from 'react-feather';
import { getOptimiserTime } from 'utils/optimiser';
import styles from './OptimiserConflicts.scss';

type Props = {
  timeRangeConflicts: TimeRangeConflict[];
  lessonTimeRange: TimeRange;
};

const OptimiserTimeRangeConflicts: React.FC<Props> = ({ timeRangeConflicts, lessonTimeRange }) =>
  !isEmpty(timeRangeConflicts) && (
    <section className={styles.conflictWarning} role="alert">
      <h3>
        <X className="svg svg-med" />
        Lesson Time Conflicts
      </h3>

      <h4>
        The following pinned class(es) require live attendance outside your selected lesson times (
        {getOptimiserTime(lessonTimeRange.earliest)} - {getOptimiserTime(lessonTimeRange.latest)}):
      </h4>

      <ul>
        {timeRangeConflicts.map((conflict) => (
          <li key={`${conflict.moduleCode}-${conflict.lessonType}`}>
            <strong>{conflict.displayText}</strong> ({conflict.classNo}) cannot be assigned within
            your selected lesson times
          </li>
        ))}
      </ul>

      <h5>
        Consider unpinning these lessons, disabling live attendance, or widening your lesson times.
      </h5>
    </section>
  );

export default OptimiserTimeRangeConflicts;
