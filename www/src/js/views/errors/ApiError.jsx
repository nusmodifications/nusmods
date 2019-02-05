// @flow
import type { Node } from 'react';

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import RandomKawaii from 'views/components/RandomKawaii';
import Title from 'views/components/Title';
import styles from './ErrorPage.scss';

type Props = {
  children?: Node,
  retry?: () => void,
  dataName?: string,
};

export default class ApiError extends PureComponent<Props> {
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
    const message = dataName ? `We can't load the ${dataName}` : "We can't connect to NUSMods";

    return (
      <div>
        <Title>Oh no...</Title>

        <div className={styles.container}>
          <div className={styles.header}>
            <RandomKawaii size={100} />
          </div>

          <h1 className={classnames('h3', styles.header)}>
            <span className={styles.expr}>Oh no...</span> {message}
          </h1>

          <p>This could be because your device is offline or NUSMods is down :(</p>

          {retry && (
            <div>
              <button className="btn btn-primary btn-lg" onClick={retry}>
                Click to try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
