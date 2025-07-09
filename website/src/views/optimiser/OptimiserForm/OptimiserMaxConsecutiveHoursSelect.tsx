import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import Tooltip from 'views/components/Tooltip';
import { Info } from 'react-feather';
import classNames from 'classnames';
import { range } from 'lodash';

import styles from './OptimiserMaxConsecutiveHoursSelect.scss';

type Props = {
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserMaxConsecutiveHoursSelect: React.FC<Props> = ({ optimiserFormFields }) => {
  const { maxConsecutiveHours, setMaxConsecutiveHours } = optimiserFormFields;

  const values = range(1, 7);

  return (
    <div className={styles.maxConsecutiveHours}>
      <div className={styles.maxConsecutiveHoursGroup}>
        <div className={styles.maxConsecutiveHoursHeader}>
          <div>
            Select maximum consecutive hours of live lessons
            <Tooltip
              content="Prioritises having less than this number of consecutive hours of live lessons"
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
        <select
          value={maxConsecutiveHours}
          onChange={(e) => setMaxConsecutiveHours(parseInt(e.target.value, 10))}
          className={classNames('form-select', styles.maxConsecutiveHoursInput)}
        >
          {values.map((value) => (
            <option value={value}>{value}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OptimiserMaxConsecutiveHoursSelect;
