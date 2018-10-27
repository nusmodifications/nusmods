// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

import ReactKawaii from './ReactKawaii';

export default function NotFoundPage() {
  Raven.captureMessage('404 - Page Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div className={styles.centerContainer}>
      <Title>Page Not Found</Title>
      <div className={styles.inline}>
        <h1 className={styles.bigCharacter}>4</h1>
        <ReactKawaii />
        <h1 className={styles.bigCharacter}>4</h1>
      </div>
      <h2>Ooops, page not found.</h2>
      <p>
        Are you <em>really</em> sure you are at the right page?
      </p>
      <div className={styles.authButtonContainer}>
        <button
          className="btn btn-primary btn-svg"
          onClick={() => Raven.showReportDialog({ eventId })}
        >
          Something should be here
        </button>
        <button className="btn btn-outline-primary btn-svg">
          <Link to="/">Woosp, bring me home</Link>
        </button>
      </div>
    </div>
  );
}
