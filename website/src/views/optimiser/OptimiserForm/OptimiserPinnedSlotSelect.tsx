import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import classNames from 'classnames';
import { LessonKey, LessonOption, PinnedSlotOption } from 'types/optimiser';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import styles from './OptimiserPinnedSlotSelect.scss';
import OptimiserFormTooltip from './OptimiserFormTooltip';

export const UNPINNED_OPTION_LABEL = 'Any (optimise for me)';

type Props = {
  lessonOptions: LessonOption[];
  pinnedSlotOptions: Record<LessonKey, PinnedSlotOption[]>;
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserPinnedSlotSelect: React.FC<Props> = ({
  lessonOptions,
  pinnedSlotOptions,
  optimiserFormFields,
}) => {
  const { pinnedSlots, setPinnedSlots } = optimiserFormFields;

  const setPinnedSlot = useCallback(
    (lessonKey: LessonKey, classNo: string) => {
      setPinnedSlots((prev) => {
        const next = { ...prev };
        if (classNo === '') {
          delete next[lessonKey];
        } else {
          next[lessonKey] = classNo;
        }
        return next;
      });
    },
    [setPinnedSlots],
  );

  if (isEmpty(lessonOptions)) {
    // OptimiserLessonOptionSelect already shows the "no lessons" warning
    return null;
  }

  return (
    <section className={styles.pinnedSlotSection}>
      <h4 className={styles.optimiserDescription}>
        Pin specific classes (optional)
        <OptimiserFormTooltip content="Pinned classes are kept exactly as chosen, and the optimiser plans the remaining lessons around them" />
      </h4>

      <div className={styles.pinnedSlotRows}>
        {lessonOptions.map((option) => (
          <div key={option.lessonKey} className={styles.pinnedSlotRow}>
            <span className={classNames(`color-${option.colorIndex}`, styles.lessonLabel)}>
              {option.displayText}
            </span>

            <label htmlFor={`pinned-slot-${option.lessonKey}`} hidden>
              Pin a class for {option.displayText}
            </label>
            <select
              id={`pinned-slot-${option.lessonKey}`}
              className={styles.optimiserDropdown}
              value={pinnedSlots[option.lessonKey] ?? ''}
              onChange={(e) => setPinnedSlot(option.lessonKey, e.target.value)}
            >
              <option value="">{UNPINNED_OPTION_LABEL}</option>
              {(pinnedSlotOptions[option.lessonKey] ?? []).map((pinnedSlotOption) => (
                <option key={pinnedSlotOption.classNo} value={pinnedSlotOption.classNo}>
                  {pinnedSlotOption.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OptimiserPinnedSlotSelect;
