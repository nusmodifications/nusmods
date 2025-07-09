import { isEmpty } from 'lodash';
import { LessonOption } from 'types/optimiser';

import { AlertTriangle } from 'react-feather';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import { useCallback } from 'react';
import classNames from 'classnames';
import styles from './OptimiserLessonOptionSelect.scss';

type Props = {
  lessonOptions: LessonOption[];
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserLessonOptionSelect: React.FC<Props> = ({ lessonOptions, optimiserFormFields }) => {
  const { physicalLessonOptions, setPhysicalLessonOptions } = optimiserFormFields;

  const togglePhysicalLessonOption = useCallback(
    (target: LessonOption) => {
      const isSelected = physicalLessonOptions.some(
        (selected) => selected.lessonKey === target.lessonKey,
      );
      setPhysicalLessonOptions((prev) =>
        isSelected
          ? prev.filter((option) => option.lessonKey !== target.lessonKey)
          : [...prev, target],
      );
    },
    [physicalLessonOptions, setPhysicalLessonOptions],
  );

  return (
    <div className={styles.lessonButtons}>
      {isEmpty(lessonOptions) && (
        <div className={styles.noLessonsFound}>
          <div className={styles.noLessonsHeader}>
            <AlertTriangle size={20} />
            No Lessons Found
          </div>
          <div className={styles.noLessonsDescription}>
            Add modules to your timetable to see lesson options here
          </div>
        </div>
      )}

      {lessonOptions.map((option) => {
        const isSelected = physicalLessonOptions.some(
          (lessonOption) => lessonOption.lessonKey === option.lessonKey,
        );

        return (
          <button
            key={option.lessonKey}
            type="button"
            onClick={() => togglePhysicalLessonOption(option)}
            className={classNames(
              `color-${option.colorIndex}`,
              styles.lessonTag,
              styles.tag,
              styles.lessonButton,
              isSelected ? styles.selected : styles.unselected,
            )}
          >
            <div className={styles.lessonButtonText}>{option.displayText}</div>
          </button>
        );
      })}
    </div>
  );
};

export default OptimiserLessonOptionSelect;
