// @flow
import type { Node } from 'react';

import React, { PureComponent } from 'react';
import Raven from 'raven-js';
import classnames from 'classnames';

import Title from 'views/components/Title';
import Online from 'views/components/Online';
import styles from './ErrorPage.scss';

type Props = {
  children?: Node,
  error?: string,
  eventId?: string,
  showRefresh: boolean,
};

export default class NotFoundPage extends PureComponent<Props> {
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

        <div className={styles.container}>
          <h1 className={classnames('h2', styles.header)}>
            <span className={styles.expr}>Uh oh...</span>
            {this.errorMessage()}
          </h1>

          {showRefresh && (
            <Online>
              <p>
                <button className={styles.link} onClick={() => window.location.reload(true)}>
                  Refreshing the page
                </button>{' '}
                may help.
              </p>
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
