import classnames from 'classnames';
import { Zap } from 'react-feather';
import {
  FreeDayConflict,
  LessonOption,
  PinnedClashConflict,
  TimeRangeConflict,
} from 'types/optimiser';
import { isEmpty } from 'lodash-es';
import styles from './OptimiserButton.scss';

export interface OptimiserButtonProps {
  isOptimising: boolean;
  lessonOptions: LessonOption[];
  freeDayConflicts: FreeDayConflict[];
  timeRangeConflicts: TimeRangeConflict[];
  pinnedClashConflicts: PinnedClashConflict[];
  onClick: () => void;
}

const OptimiserButton: React.FC<OptimiserButtonProps> = ({
  freeDayConflicts,
  timeRangeConflicts,
  pinnedClashConflicts,
  lessonOptions,
  isOptimising,
  onClick,
}) => {
  const isDisabled =
    isOptimising ||
    isEmpty(lessonOptions) ||
    !isEmpty(freeDayConflicts) ||
    !isEmpty(timeRangeConflicts) ||
    !isEmpty(pinnedClashConflicts);

  return (
    <div className={styles.optimizeButtonSection}>
      <button
        type="button"
        className={classnames(
          'btn',
          styles.optimizeButton,
          isDisabled ? styles.disabled : styles.enabled,
        )}
        disabled={isDisabled}
        onClick={onClick}
      >
        {isOptimising ? (
          <span className={styles.optimizeButtonSpinner}>
            <div className={styles.grower} />
            Searching and optimising...
          </span>
        ) : (
          <>
            <Zap
              size={20}
              className={classnames(styles.zapIcon, {
                [styles.disabled]: isDisabled,
              })}
            />
            Optimise Timetable
          </>
        )}
      </button>

      <div className={styles.estimateTime}>
        <div>estimated time:</div>
        <div className={styles.estimateTimeValue}>5s - 40s</div>
      </div>
    </div>
  );
};

export default OptimiserButton;
