import * as React from 'react';
import * as Sentry from '@sentry/browser';
import classnames from 'classnames';

import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import Online from 'views/components/Online';
import styles from './ErrorPage.scss';

type Props = {
  error?: string;
  showReportDialog?: boolean;
  showRefresh?: boolean;
};

const ErrorPage: React.FC<Props> = ({ error, showReportDialog, showRefresh = true }) => {
  const errorMessage = () => {
    let message = 'something went wrong';
    if (error) message = `${message} - ${error}`;
    return message;
  };

  return (
    <div className={styles.container}>
      <Title>Uh oh...</Title>

      <div className={styles.header}>
        <RandomKawaii size={100} />
      </div>

      <h1 className={classnames('h3', styles.header)}>
        <span className={styles.expr}>Uh oh</span> {errorMessage()}
      </h1>

      {showReportDialog && (
        <Online isLive={false}>
          <p>
            An error report has been made and we will look into this. We would really appreciate it
            if you could{' '}
            <button
              type="button"
              className={classnames('btn btn-link', styles.link)}
              onClick={() => Sentry.showReportDialog()}
            >
              tell us more about what happened
            </button>{' '}
            so we can better fix this.
          </p>
        </Online>
      )}

      {showRefresh && (
        <Online>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </Online>
      )}
    </div>
  );
};

export default React.memo(ErrorPage);
