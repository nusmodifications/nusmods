import { Button } from 'components/ui/button';
import { GitHub, Send } from 'react-feather';

import appConfig from 'config';
import styles from './OptimiserBetaNotification.scss';

const OptimiserBetaNotification = () => (
  <div className={styles.buttons}>
    <Button asChild variant="outline" size="sm">
      <a
        className={styles.actionButton}
        href={`${appConfig.contact.githubRepo}/issues`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHub size={14} />
        Feedback on GitHub
      </a>
    </Button>
    <Button asChild variant="outline" size="sm">
      <a
        className={styles.actionButton}
        href={appConfig.contact.telegram}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Send size={14} />
        Feedback on Telegram
      </a>
    </Button>
  </div>
);

export default OptimiserBetaNotification;
