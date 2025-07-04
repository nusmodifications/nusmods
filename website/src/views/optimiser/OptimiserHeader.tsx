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
        <button
          type="button"
          className={classnames('btn btn-sm btn-outline-success', styles.feedbackButton)}
          onClick={() => window.open(config.contact.telegram, '_blank')}
        >
          Beta - Leave Feedback
        </button>
      </div>
      <div className={styles.description}>
        <div className={styles.descriptionText}>
          Intelligently explores millions of combinations to generate your optimal timetable tailored
          to your preferences
        </div>
      </div>
    </div>
  );
};

export default OptimiserHeader;
