import { GitHub, Send } from 'react-feather';

import appConfig from 'config';
import styles from './OptimiserBetaNotification.scss';

const OptimiserBetaNotification = () => (
  <div className={styles.buttons}>
    <a
      className={styles.actionButton}
      href={`${appConfig.contact.githubRepo}/issues`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <GitHub size={14} />
      Feedback on GitHub
    </a>
    <a
      className={styles.actionButton}
      href={appConfig.contact.telegram}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Send size={14} />
      Feedback on Telegram
    </a>
  </div>
);

export default OptimiserBetaNotification;
