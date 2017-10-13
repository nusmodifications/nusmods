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

      <div className="page-container">
        <div className="ml-md-5 mt-3">
          <p className="mb-0 h1 text-primary">Oops...</p>
          <h1 className="mb-4">page not found.</h1>
          <p>
            If you think something <em>should</em> be here, <button
              className={styles.link}
              onClick={() => Raven.showReportDialog({ eventId })}
            >
              do tell us
            </button>
          </p>

          <p className="font-weight-bold mb-0">Otherwise, if you want to</p>
          <ul className="list-unstyled">
            <li>...plan your timetable? <Link to="/">Go back to Nusmods.com</Link></li>
            <li>...find a module? <Link to="/modules">Try the module finder</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
