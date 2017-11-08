// @flow
import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import config from 'config/index';
import styles from './ErrorPage.scss';

export default function NotFoundPage() {
  Raven.captureMessage('404 - Page Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div>
      <Helmet>
        <title>Page Not Found - {config.brandName}</title>
      </Helmet>

      <div className={styles.container}>
        <h1 className={styles.header}>
          <span className={styles.expr}>Oops...</span>
          page not found.
        </h1>
        <p>
          If you think something <em>should</em> be here, <button
            className={styles.link}
            onClick={() => Raven.showReportDialog({ eventId })}
          >
            do tell us
          </button>
        </p>

        <p className={styles.subheader}>Otherwise, if you want to</p>
        <ul className="list-unstyled">
          <li>...plan your timetable? <Link to="/">Go back to Nusmods.com</Link></li>
          <li>...find a module? <Link to="/modules">Try the module finder</Link></li>
        </ul>
      </div>
    </div>
  );
}
