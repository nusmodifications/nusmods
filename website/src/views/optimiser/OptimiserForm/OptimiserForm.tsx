import {
  FreeDayConflict,
  LessonKey,
  LessonOption,
  PinnedSlotConflict,
  PinnedSlotOption,
} from 'types/optimiser';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import styles from './OptimiserForm.scss';
import OptimiserLessonOptionSelect from './OptimiserLessonOptionSelect';
import OptimiserPinnedSlotSelect from './OptimiserPinnedSlotSelect';
import OptimiserPinnedSlotConflicts from './OptimiserPinnedSlotConflicts';
import OptimiserFreeDaySelect from './OptimiserFreeDaySelect';
import OptimiserFreeDayConflicts from './OptimiserFreeDayConflicts';
import {
  OptimiserLessonTimeRangeSelect,
  OptimiserLunchTimeRangeSelect,
} from './OptimiserTimeRangeSelect';
import OptimiserMaxConsecutiveHoursSelect from './OptimiserMaxConsecutiveHoursSelect';

interface OptimiserFormProps {
  lessonOptions: LessonOption[];
  pinnedSlotOptions: Record<LessonKey, PinnedSlotOption[]>;
  pinnedSlotConflicts: PinnedSlotConflict[];
  freeDayConflicts: FreeDayConflict[];
  hasSaturday: boolean;
  optimiserFormFields: OptimiserFormFields;
}

const OptimiserFormComponent: React.FC<OptimiserFormProps> = ({
  lessonOptions,
  pinnedSlotOptions,
  pinnedSlotConflicts,
  freeDayConflicts,
  hasSaturday,
  optimiserFormFields,
}) => (
  <form className={styles.optimiserForm}>
    <OptimiserLessonOptionSelect
      lessonOptions={lessonOptions}
      optimiserFormFields={optimiserFormFields}
    />

    <OptimiserPinnedSlotSelect
      lessonOptions={lessonOptions}
      pinnedSlotOptions={pinnedSlotOptions}
      optimiserFormFields={optimiserFormFields}
    />

    <OptimiserFreeDaySelect hasSaturday={hasSaturday} optimiserFormFields={optimiserFormFields} />

    <OptimiserFreeDayConflicts freeDayConflicts={freeDayConflicts} />

    <OptimiserPinnedSlotConflicts pinnedSlotConflicts={pinnedSlotConflicts} />

    <OptimiserLessonTimeRangeSelect optimiserFormFields={optimiserFormFields} />

    <div className={styles.priorityNotice}>
      Following preferences will be <strong className={styles.prioritised}>prioritised</strong> but{' '}
      <strong className={styles.notGuaranteed}>not guaranteed</strong> :
    </div>

    <OptimiserMaxConsecutiveHoursSelect optimiserFormFields={optimiserFormFields} />

    <OptimiserLunchTimeRangeSelect optimiserFormFields={optimiserFormFields} />
  </form>
);

export default OptimiserFormComponent;
