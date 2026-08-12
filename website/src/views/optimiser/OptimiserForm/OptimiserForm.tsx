import { ClassNo } from 'types/modules';
import {
  FreeDayConflict,
  LessonKey,
  LessonOption,
  PinnedClashConflict,
  TimeRangeConflict,
} from 'types/optimiser';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import styles from './OptimiserForm.scss';
import OptimiserLessonOptionSelect from './OptimiserLessonOptionSelect';
import OptimiserPinnedSlotSelect from './OptimiserPinnedSlotSelect';
import OptimiserFreeDaySelect from './OptimiserFreeDaySelect';
import OptimiserFreeDayConflicts from './OptimiserFreeDayConflicts';
import OptimiserPinnedClashConflicts from './OptimiserPinnedClashConflicts';
import OptimiserTimeRangeConflicts from './OptimiserTimeRangeConflicts';
import {
  OptimiserLessonTimeRangeSelect,
  OptimiserLunchTimeRangeSelect,
} from './OptimiserTimeRangeSelect';
import OptimiserMaxConsecutiveHoursSelect from './OptimiserMaxConsecutiveHoursSelect';

interface OptimiserFormProps {
  lessonOptions: LessonOption[];
  timetableClassNos: Record<LessonKey, ClassNo>;
  freeDayConflicts: FreeDayConflict[];
  timeRangeConflicts: TimeRangeConflict[];
  pinnedClashConflicts: PinnedClashConflict[];
  hasSaturday: boolean;
  optimiserFormFields: OptimiserFormFields;
}

const OptimiserFormComponent: React.FC<OptimiserFormProps> = ({
  lessonOptions,
  timetableClassNos,
  freeDayConflicts,
  timeRangeConflicts,
  pinnedClashConflicts,
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
      timetableClassNos={timetableClassNos}
      optimiserFormFields={optimiserFormFields}
    />

    <OptimiserPinnedClashConflicts pinnedClashConflicts={pinnedClashConflicts} />

    <OptimiserFreeDaySelect hasSaturday={hasSaturday} optimiserFormFields={optimiserFormFields} />

    <OptimiserFreeDayConflicts freeDayConflicts={freeDayConflicts} />

    <OptimiserLessonTimeRangeSelect optimiserFormFields={optimiserFormFields} />

    <OptimiserTimeRangeConflicts
      timeRangeConflicts={timeRangeConflicts}
      lessonTimeRange={optimiserFormFields.lessonTimeRange}
    />

    <div className={styles.priorityNotice}>
      Following preferences will be <strong className={styles.prioritised}>prioritised</strong> but{' '}
      <strong className={styles.notGuaranteed}>not guaranteed</strong> :
    </div>

    <OptimiserMaxConsecutiveHoursSelect optimiserFormFields={optimiserFormFields} />

    <OptimiserLunchTimeRangeSelect optimiserFormFields={optimiserFormFields} />
  </form>
);

export default OptimiserFormComponent;
