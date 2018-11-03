// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import type { ModuleCode } from 'types/modules';
import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

type Props = {
  moduleCode: ModuleCode,
};

export default function NotFoundPage({ moduleCode }: Props) {
  Raven.captureMessage('404 - Module Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div>
      <Title>Module Not Found</Title>

      <div className={styles.container}>
        <h1 className={styles.header}>
          <span className={styles.expr}>Oops...</span>
          module {moduleCode} not found.
        </h1>
        <p>
          This usually means you have a typo in the module code, or the module is not offered this
          year.
        </p>
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
