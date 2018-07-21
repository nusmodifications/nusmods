// @flow
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect, type MapStateToProps } from 'react-redux';
import type { State } from 'reducers';
import { getRegistration } from 'bootstrapping/service-worker';
import { Refresh } from 'views/components/icons';
import styles from './Announcements.scss';

type Props = {
  showPrompt: boolean,
};

class RefreshPrompt extends PureComponent<Props> {
  render() {
    if (!this.props.showPrompt) {
      return null;
    }

    return (
      <div className={classnames('alert alert-success', styles.announcement)}>
        <Refresh className={styles.backgroundIcon} />

        <div>
          <h3>A new version of NUSMods is available</h3>
          <p>Please refresh the page to get the latest version.</p>
        </div>

        <button
          className="btn btn-success"
          type="button"
          onClick={() => {
            const registration = getRegistration();
            if (!registration || !registration.waiting) {
              // Just to ensure registration.waiting is available before
              // calling postMessage()
              return;
            }

            registration.waiting.postMessage('skipWaiting');
          }}
        >
          Refresh page
        </button>
      </div>
    );
  }
}

const mapPropsToState: MapStateToProps<*, *, *> = (state: State) => ({
  showPrompt: state.app.promptRefresh,
});

export default connect(mapPropsToState)(RefreshPrompt);
