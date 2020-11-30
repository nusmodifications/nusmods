import * as React from 'react';
import { Link } from 'react-router-dom';
import * as Sentry from '@sentry/browser';

import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

const NotFoundPage: React.FC = () => {
  Sentry.withScope(() => {
    Sentry.captureMessage('404 - Page Not Found');
  });

  return (
    <div className={styles.container}>
      <Title>Page Not Found</Title>

      <div className={styles.heading}>
        <span className={styles.bigCharacter}>4</span>
        <RandomKawaii aria-label="0" title="0" size={100} />
        <span className={styles.bigCharacter}>4</span>
      </div>

      <h2>Ooops, page not found.</h2>
      <p>Are you sure you are at the right page?</p>

      <div className={styles.buttons}>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => Sentry.showReportDialog()}
        >
          Something should be here
        </button>
        <Link className="btn btn-primary" to="/">
          Bring me home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
