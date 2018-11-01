// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

export default function NotFoundPage() {
  Raven.captureMessage('404 - Page Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div>
      <Title>Page Not Found</Title>

      <div className={styles.container}>
        <h1 className={styles.header}>
          <span className={styles.expr}>Oops...</span>
          page not found.
        </h1>
        <p>
          If you think something <em>should</em> be here,{' '}
          <button className={styles.link} onClick={() => Raven.showReportDialog({ eventId })}>
            do tell us
          </button>
          !
        </p>

        <p>
          Otherwise, <Link to="/">go back to nusmods.com</Link> or{' '}
          <Link to="/modules">try the module finder</Link>.
        </p>
      </div>
    </div>
  );
}
