import React from 'react';
import classnames from 'classnames';
import { Zap } from 'react-feather';
import { FreeDayConflict, LessonOption } from 'types/optimiser';
import styles from './OptimiserButton.scss';

interface OptimiserButtonProps {
  freeDayConflicts: FreeDayConflict[];
  lessonOptions: LessonOption[];
  isOptimising: boolean;
  onClick: () => void;
}

const OptimiserButton: React.FC<OptimiserButtonProps> = ({
  freeDayConflicts,
  lessonOptions,
  isOptimising,
  onClick,
}) => (
  <div className={styles.optimizeButtonSection}>
    <button
      type="button"
      className={classnames(
        'btn',
        styles.optimizeButton,
        freeDayConflicts.length > 0 || isOptimising || lessonOptions.length === 0
          ? styles.disabled
          : styles.enabled,
        {
          disabled: isOptimising || freeDayConflicts.length > 0 || lessonOptions.length === 0,
        },
      )}
      onClick={() => {
        onClick();
      }}
    >
      {!isOptimising ? (
        <Zap
          size={20}
          fill={freeDayConflicts.length > 0 || lessonOptions.length === 0 ? '#69707a' : '#ff5138'}
        />
      ) : (
        <span className={styles.optimizeButtonSpinner}>
          {isOptimising && <div className={styles.grower} />}
        </span>
      )}
      {isOptimising ? 'Searching and optimising...' : 'Optimise Timetable'}
    </button>
    <div className={styles.estimateTime}>
      <div>estimated time:</div>
      <div className={styles.estimateTimeValue}>5s - 40s</div>
    </div>
  </div>
);

export default OptimiserButton;
