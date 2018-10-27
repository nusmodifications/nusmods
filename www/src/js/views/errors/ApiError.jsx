// @flow
import type { Node } from 'react';

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

import ReactKawaii from './ReactKawaii';

type Props = {
  children?: Node,
  retry?: () => void,
  dataName?: string,
};

export default class ApiError extends PureComponent<Props> {
  static defaultProps = {
    showRefresh: true,
  };

  componentDidMount() {
    if (!navigator.onLine) {
      window.addEventListener('online', this.onlineListener);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.onlineListener);
  }

  onlineListener = () => {
    if (this.props.retry && navigator.onLine) {
      this.props.retry();
    }
  };

  render() {
    const { retry, dataName } = this.props;
    const message = dataName ? `We can't load ${dataName}` : "We can't connect to NUSMods";

    return (
      <div className={styles.centerContainer}>
        <Title>Oh no...</Title>

        <div>
          <div className={styles.inline}>
            <h1 className={styles.bigCharacter}>4</h1>
            <ReactKawaii />
            <h1 className={styles.bigCharacter}>4</h1>
          </div>

          <h1 className={classnames('h2', styles.header)}>
            <span className={styles.expr}>Oh no...</span>
            {message}
          </h1>

          <p>This could be because your computer is offline or NUSMods is down :(</p>

          {retry && (
            <div>
              <button className="btn btn-primary btn-lg" onClick={retry}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
