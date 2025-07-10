import { FreeDayConflict, LessonOption } from 'types/optimiser';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import styles from './OptimiserForm.scss';
import OptimiserLessonOptionSelect from './OptimiserLessonOptionSelect';
import OptimiserFreeDaySelect from './OptimiserFreeDaySelect';
import OptimiserFreeDayConflicts from './OptimiserFreeDayConflicts';
import {
  OptimiserLessonTimeRangeSelect,
  OptimiserLunchTimeRangeSelect,
} from './OptimiserTimeRangeSelect';
import OptimiserMaxConsecutiveHoursSelect from './OptimiserMaxConsecutiveHoursSelect';

interface OptimiserFormProps {
  lessonOptions: LessonOption[];
  freeDayConflicts: FreeDayConflict[];
  hasSaturday: boolean;
  optimiserFormFields: OptimiserFormFields;
}

const OptimiserFormComponent: React.FC<OptimiserFormProps> = ({
  lessonOptions,
  freeDayConflicts,
  hasSaturday,
  optimiserFormFields,
}) => (
  <form className={styles.optimiserForm}>
    <OptimiserLessonOptionSelect
      lessonOptions={lessonOptions}
      optimiserFormFields={optimiserFormFields}
    />

    <OptimiserFreeDaySelect hasSaturday={hasSaturday} optimiserFormFields={optimiserFormFields} />

    <OptimiserFreeDayConflicts freeDayConflicts={freeDayConflicts} />

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
