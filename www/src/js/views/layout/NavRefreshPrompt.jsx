// @flow

import React, { PureComponent } from 'react';
import { updateServiceWorker } from 'bootstrapping/service-worker';
import classnames from 'classnames';
import { RefreshIcon } from 'views/components/icons';
import LoadingSpinner from 'views/components/LoadingSpinner';
import styles from './NavRefreshPrompt.scss';

type Props = {};

type State = {
  isReloading: boolean,
};

export default class NavRefreshPrompt extends PureComponent<Props, State> {
  state = {
    isReloading: false,
  };

  onReload = () => {
    this.setState({ isReloading: true });
    updateServiceWorker();
  };

  render() {
    const { isReloading } = this.state;

    return (
      <button
        className={styles.refreshPrompt}
        type="button"
        onClick={this.onReload}
        disabled={isReloading}
      >
        <div className={classnames('alert alert-success')}>
          <RefreshIcon size={30} className={styles.refreshIcon} />
          NUSMods update available
          <div
            className={classnames('btn btn-sm btn-block btn-success', { disabled: isReloading })}
          >
            {isReloading ? <LoadingSpinner small /> : 'Refresh page'}
          </div>
        </div>
      </button>
    );
  }
}
