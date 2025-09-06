import { isEmpty } from 'lodash';
import { LessonOption } from 'types/optimiser';

import { AlertTriangle } from 'react-feather';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import { useCallback } from 'react';
import classNames from 'classnames';
import styles from './OptimiserLessonOptionSelect.scss';
import OptimiserFormTooltip from './OptimiserFormTooltip';

type Props = {
  lessonOptions: LessonOption[];
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserLessonOptionSelect: React.FC<Props> = ({ lessonOptions, optimiserFormFields }) => {
  const { liveLessonOptions, setLiveLessonOptions } = optimiserFormFields;

  const toggleLiveLessonOption = useCallback(
    (target: LessonOption) => {
      const isSelected = liveLessonOptions.some(
        (selected) => selected.lessonKey === target.lessonKey,
      );
      setLiveLessonOptions((prev) =>
        isSelected
          ? prev.filter((option) => option.lessonKey !== target.lessonKey)
          : [...prev, target],
      );
    },
    [liveLessonOptions, setLiveLessonOptions],
  );

  return (
    <section>
      <h4 className={styles.optimiserDescription}>
        Select lessons you plan to attend live (in person/online)
        <OptimiserFormTooltip content="Chosen lessons will only be allocated on your school days" />
      </h4>

      {isEmpty(lessonOptions) ? (
        <div className={styles.noLessonsWarning} role="alert">
          <h3>
            <AlertTriangle size={20} />
            No Lessons Found
          </h3>
          <h4>Add modules to your timetable to see lesson options here</h4>
        </div>
      ) : (
        <div className={styles.lessonButtons}>
          {lessonOptions.map((option) => {
            const isSelected = liveLessonOptions.some(
              (lessonOption) => lessonOption.lessonKey === option.lessonKey,
            );
            const className = classNames(
              `color-${option.colorIndex}`,
              styles.lessonButton,
              isSelected ? styles.selected : styles.unselected,
            );

            return (
              <button
                key={option.lessonKey}
                type="button"
                onClick={() => toggleLiveLessonOption(option)}
                className={className}
              >
                {option.displayText}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OptimiserLessonOptionSelect;
