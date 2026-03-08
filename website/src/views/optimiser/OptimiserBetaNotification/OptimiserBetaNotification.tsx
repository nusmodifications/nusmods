import { memo } from 'react';
import { Heart, GitHub, Send } from 'react-feather';

import appConfig from 'config';
import styles from './Announcements.scss';

const OptimiserBetaNotification = memo(() => (
  <div className={`alert alert-success no-export ${styles.announcement}`}>
    <Heart className={styles.backgroundIcon} />

    <div className={styles.body}>
      <h3>Optimiser Beta</h3>
      <p className={styles.bodyElement}>
        The timetable optimiser is currently in beta. You may encounter bugs or unexpected
        behaviour. Your feedback helps us improve!
      </p>
    </div>

    <div className={styles.buttons}>
      <a
        className={styles.actionButton}
        href={`${appConfig.contact.githubRepo}/issues`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHub size={14} />
        Report on GitHub
      </a>
      <a
        className={styles.actionButton}
        href={appConfig.contact.telegram}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Send size={14} />
        Report on Telegram
      </a>
    </div>
  </div>
));

export default OptimiserBetaNotification;
