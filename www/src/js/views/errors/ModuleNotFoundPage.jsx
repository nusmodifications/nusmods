// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import type { ModuleCode } from 'types/modules';
import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

import ReactKawaii from './ReactKawaii';

type Props = {
  moduleCode: ModuleCode,
};

export default function NotFoundPage({ moduleCode }: Props) {
  Raven.captureMessage('404 - Module Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div className={styles.centerContainer}>
      <Title>Module Not Found</Title>

      <div className={styles.inline}>
        <h1 className={styles.bigCharacter}>4</h1>
        <ReactKawaii />
        <h1 className={styles.bigCharacter}>4</h1>
      </div>

      <h2>Ooops, module {moduleCode} not found.</h2>
      <p>
        This usually means you have a typo in the module code, or the module is not offered this
        year. <br /> Are you <em>really</em> sure you are at the right page?
      </p>

      <div className={styles.authButtonContainer}>
        <button
          className="btn btn-primary btn-svg"
          onClick={() => Raven.showReportDialog({ eventId })}
        >
          {moduleCode} should be here
        </button>
        <button className="btn btn-outline-primary btn-svg">
          <Link to="/">Woops, bring me home</Link>
        </button>
      </div>
    </div>
  );
}
