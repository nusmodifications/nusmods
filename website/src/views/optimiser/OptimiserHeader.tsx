import React from 'react';
import classnames from 'classnames';
import { Cpu } from 'react-feather';
import useMediaQuery from 'views/hooks/useMediaQuery';
import { breakpointDown } from 'utils/css';
import config from 'config';
import styles from './OptimiserHeader.scss';

const OptimiserHeader: React.FC = () => {
  const isMobile = useMediaQuery(breakpointDown('md'));

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.title}>
          <Cpu size={isMobile ? 22 : 25} className={styles.titleIcon} />
          Timetable Optimiser
        </div>
      </div>

      <div className={styles.description}>
        <div className={styles.descriptionText}>
          Explore thousands of combinations to generate a timetable that is tailored to your
          preferences.
        </div>
      </div>
    </div>
  );
};

export default OptimiserHeader;
