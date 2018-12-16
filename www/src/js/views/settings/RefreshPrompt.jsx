// @flow
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import type { State } from 'reducers';
import { updateServiceWorker } from 'bootstrapping/service-worker';
import { Refresh } from 'views/components/icons';
import styles from 'views/components/notfications/Announcements.scss';

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

        <div className={styles.body}>
          <h3>A new version of NUSMods is available</h3>
          <p>Please refresh the page to get the latest version.</p>
        </div>

        <div className={styles.buttons}>
          <button className="btn btn-success" type="button" onClick={updateServiceWorker}>
            Refresh page
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state: State) => ({
  showPrompt: state.app.promptRefresh,
}))(RefreshPrompt);
