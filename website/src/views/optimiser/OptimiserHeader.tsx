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
        <div>
          Intelligently explores millions of combinations to generate your optimal timetable —
          prioritising
        </div>
        <div>
          <b>
            preferred free days, ideal class timings, lunch flexibility, and minimal travel between
            classes
          </b>
          .
        </div>
      </div>
    </div>
  );
};

export default OptimiserHeader;
