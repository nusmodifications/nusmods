// @flow
import type { Node } from 'react';

import React, { PureComponent } from 'react';
import Raven from 'raven-js';
import classnames from 'classnames';

import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import Online from 'views/components/Online';
import styles from './ErrorPage.scss';

type Props = {
  children?: Node,
  error?: string,
  eventId?: ?string,
  showRefresh: boolean,
};

export default class ErrorPage extends PureComponent<Props> {
  static defaultProps = {
    showRefresh: true,
  };

  errorMessage() {
    let message = 'something went wrong';
    if (this.props.error) message = `${message} - ${this.props.error}`;
    return message;
  }

  render() {
    const { showRefresh, eventId } = this.props;

    return (
      <div>
        <Title>Uh oh...</Title>

        <div className={styles.centerContainer}>
          <div className={styles.header}>
            <RandomKawaii size={100} mood="sad" color="#FF715D" />
          </div>
          <h1 className={classnames('h2', styles.header)}>Uh oh, {this.errorMessage()}.</h1>

          {showRefresh && (
            <Online>
              <button
                className="btn btn-primary btn-svg"
                onClick={() => window.location.reload(true)}
              >
                Refresh
              </button>
            </Online>
          )}

          {eventId && (
            <Online isLive={false}>
              <p>
                An error report has been made and we will look into this. We would really appreciate
                it if you could{' '}
                <button className={styles.link} onClick={() => Raven.showReportDialog({ eventId })}>
                  tell us more about what happened
                </button>{' '}
                so we can better fix this.
              </p>
            </Online>
          )}
        </div>
      </div>
    );
  }
}
