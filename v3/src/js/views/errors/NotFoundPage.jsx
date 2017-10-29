// @flow
import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import config from 'config/index';
import errorPgStyles from './ErrorPage.scss';
import styles from './NotFoundPage.scss';

export default function NotFoundPage() {
  Raven.captureMessage('404 - Page Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div>
      <Helmet>
        <title>Page Not Found - {config.brandName}</title>
      </Helmet>

      <div className={errorPgStyles.container}>
        <h1 className={errorPgStyles.header}>
          <span className={errorPgStyles.expr}>Oops...</span>
          page not found.
        </h1>
        <p>
          If you think something <em>should</em> be here, <button
            className={errorPgStyles.link}
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
