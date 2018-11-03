// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import type { ModuleCode } from 'types/modules';
import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

type Props = {
  moduleCode: ModuleCode,
};

export default function NotFoundPage({ moduleCode }: Props) {
  Raven.captureMessage('404 - Module Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div className={styles.centerContainer}>
      <Title>Module Not Found</Title>

      <div className={styles.inlineContainer}>
        <span className={styles.bigCharacter}>4</span>
        <RandomKawaii aria-label="0" title="0" size={100} mood="sad" color="#FF715D" />
        <span className={styles.bigCharacter}>4</span>
      </div>

      <h2>Ooops, module {moduleCode} not found.</h2>
      <p>
        This usually means you have a typo in the module code, or the module is not offered this
        year. <br /> Are you sure you are at the right page?
      </p>

      <div className={styles.errorButtonContainer}>
        <button
          className="btn btn-primary btn-svg"
          onClick={() =>
            Raven.showReportDialog({
              eventId,
            })
          }
        >
          {moduleCode} should be here
        </button>
        <Link className="btn btn-outline-primary btn-svg" to="/">
          Woops, bring me home
        </Link>
      </div>
    </div>
  );
}
