import classNames from 'classnames';
import { dropRight } from 'lodash';
import { useCallback } from 'react';
import { DayText, WorkingDays } from 'types/modules';
import { OptimiserFormFields } from 'views/hooks/useOptimiserForm';
import Tooltip from 'views/components/Tooltip';
import { Info } from 'react-feather';

import styles from './OptimiserFreeDaySelect.scss';

type Props = {
  hasSaturday: boolean;
  optimiserFormFields: OptimiserFormFields;
};

const OptimiserFreeDaySelect: React.FC<Props> = ({ hasSaturday, optimiserFormFields }) => {
  const { freeDays, setFreeDays } = optimiserFormFields;
  const days = hasSaturday ? [...WorkingDays] : dropRight([...WorkingDays], 1);

  const toggleDay = useCallback(
    (day: DayText) => {
      const isSelected = freeDays.has(day);
      setFreeDays((prev) =>
        isSelected ? prev.difference(new Set([day])) : prev.union(new Set([day])),
      );
    },
    [freeDays, setFreeDays],
  );

  return (
    <>
      <div className={styles.freeDaysSection}>
        Select days you would like to be free
        <Tooltip content="Chosen days will have no physical classes" placement="right">
          <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
        </Tooltip>
      </div>
      <div className={styles.freeDaysButtons}>
        {days.map((day) => (
          <button
            type="button"
            className={classNames('btn btn-outline-primary btn-svg', {
              active: freeDays.has(day),
            })}
            onClick={() => toggleDay(day)}
          >
            Monday
          </button>
        ))}
      </div>
    </>
  );
};

export default OptimiserFreeDaySelect;
