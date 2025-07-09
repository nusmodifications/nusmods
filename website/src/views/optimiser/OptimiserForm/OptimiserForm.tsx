import { Info } from 'react-feather';
import Tooltip from 'views/components/Tooltip';
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
  <div className={styles.mainContent}>
    <div className={styles.sectionHeader}>
      <div>
        Select lessons you plan to attend live (in person, online, or other format)
        <Tooltip
          content="Chosen lessons will only be allocated on your school days"
          placement="right"
        >
          <Info
            className={`${styles.tag} ${styles.infoIcon}`}
            style={{ marginLeft: '0.5rem' }}
            size={15}
          />
        </Tooltip>
      </div>
    </div>

    <OptimiserLessonOptionSelect
      lessonOptions={lessonOptions}
      optimiserFormFields={optimiserFormFields}
    />

    <OptimiserFreeDaySelect hasSaturday={hasSaturday} optimiserFormFields={optimiserFormFields} />

    <OptimiserFreeDayConflicts freeDayConflicts={freeDayConflicts} />

    <OptimiserLessonTimeRangeSelect optimiserFormFields={optimiserFormFields} />

    <div className={styles.priorityNotice}>
      Following preferences will be <strong className={styles.prioritised}>prioritised</strong>
      but <strong className={styles.notGuaranteed}>not guaranteed</strong> :
    </div>

    <OptimiserMaxConsecutiveHoursSelect optimiserFormFields={optimiserFormFields} />

    <OptimiserLunchTimeRangeSelect optimiserFormFields={optimiserFormFields} />
  </div>
);

export default OptimiserFormComponent;
