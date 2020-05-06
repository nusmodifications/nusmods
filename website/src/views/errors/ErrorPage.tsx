import * as React from 'react';
import * as Sentry from '@sentry/browser';
import classnames from 'classnames';

import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import Online from 'views/components/Online';
import styles from './ErrorPage.scss';

type Props = {
  children?: React.ReactNode;
  error?: string;
  showReportDialog?: boolean;
  showRefresh: boolean;
};

const ErrorPage = (props: Props) => {
  const errorMessage = () => {
    let message = 'something went wrong';
    if (props.error) message = `${message} - ${props.error}`;
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

      {props.showReportDialog && (
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

      {props.showRefresh && (
        <Online>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload(true)}
          >
            Refresh
          </button>
        </Online>
      )}
    </div>
  );
};

ErrorPage.defaultProps = {
  showRefresh: true,
};

export default React.memo(ErrorPage);
