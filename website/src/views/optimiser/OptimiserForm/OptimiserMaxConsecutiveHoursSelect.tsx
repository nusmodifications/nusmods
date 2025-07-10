import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import { range } from 'lodash';

import styles from './OptimiserMaxConsecutiveHoursSelect.scss';
import OptimiserFormTooltip from './OptimiserFormTooltip';

type Props = {
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserMaxConsecutiveHoursSelect: React.FC<Props> = ({ optimiserFormFields }) => {
  const { maxConsecutiveHours, setMaxConsecutiveHours } = optimiserFormFields;

  const values = range(1, 7);

  return (
    <div className={styles.maxConsecutiveHours}>
      <span className={styles.optimiserDescription}>
        <h4>Select maximum consecutive hours of live lessons</h4>
        <OptimiserFormTooltip content="Prioritises having less than this number of consecutive hours of live lessons" />
      </span>

      <select
        value={maxConsecutiveHours}
        onChange={(e) => setMaxConsecutiveHours(parseInt(e.target.value, 10))}
        className={styles.optimiserDropdown}
      >
        {values.map((value) => (
          <option value={value}>{value}</option>
        ))}
      </select>
    </div>
  );
};

export default OptimiserMaxConsecutiveHoursSelect;
