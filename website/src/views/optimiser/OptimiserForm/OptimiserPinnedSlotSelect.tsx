import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import classNames from 'classnames';
import { ClassNo, Venue } from 'types/modules';
import { LessonKey, LessonOption } from 'types/optimiser';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import styles from './OptimiserPinnedSlotSelect.scss';
import OptimiserFormTooltip from './OptimiserFormTooltip';

type Props = {
  lessonOptions: LessonOption[];
  timetableClassNos: Record<LessonKey, ClassNo>;
  pinnedSlotVenues: Record<LessonKey, Venue>;
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserPinnedSlotSelect: React.FC<Props> = ({
  lessonOptions,
  timetableClassNos,
  pinnedSlotVenues,
  optimiserFormFields,
}) => {
  const { pinnedLessonKeys, setPinnedLessonKeys } = optimiserFormFields;

  const togglePinnedLesson = useCallback(
    (lessonKey: LessonKey) => {
      setPinnedLessonKeys((prev) => {
        const next = new Set(prev);
        if (next.has(lessonKey)) {
          next.delete(lessonKey);
        } else {
          next.add(lessonKey);
        }
        return next;
      });
    },
    [setPinnedLessonKeys],
  );

  if (isEmpty(lessonOptions)) {
    // OptimiserLessonOptionSelect already shows the "no lessons" warning
    return null;
  }

  return (
    <section className={styles.pinnedSlotSection}>
      <h4 className={styles.optimiserDescription}>
        Select lessons to pin
        <OptimiserFormTooltip content="Pinned lessons are locked to the class selected in your timetable, and the optimiser plans the remaining lessons around them" />
      </h4>

      <div className={styles.pinnedSlotButtons}>
        {lessonOptions.map((option) => {
          const classNo = timetableClassNos[option.lessonKey];
          const venue = pinnedSlotVenues[option.lessonKey];
          const isPinned = pinnedLessonKeys.has(option.lessonKey);
          const className = classNames(
            `color-${option.colorIndex}`,
            styles.pinnedSlotButton,
            isPinned ? styles.selected : styles.unselected,
          );

          return (
            <button
              key={option.lessonKey}
              type="button"
              disabled={!classNo}
              onClick={() => togglePinnedLesson(option.lessonKey)}
              className={className}
            >
              {classNo ? (
                <>
                  <div className={styles.pinnedSlotModuleCode}>{option.moduleCode}</div>
                  <div>
                    {LESSON_TYPE_ABBREV[option.lessonType]} [{classNo}]
                  </div>
                  {venue && <div>{venue.startsWith('E-Learn') ? 'E-Learning' : venue}</div>}
                </>
              ) : (
                option.displayText
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default OptimiserPinnedSlotSelect;
