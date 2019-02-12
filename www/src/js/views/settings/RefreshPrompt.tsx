import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { State as StoreState } from 'reducers';
import { updateServiceWorker } from 'bootstrapping/service-worker';
import { Refresh } from 'views/components/icons';
import styles from 'views/components/notfications/Announcements.scss';
import LoadingSpinner from 'views/components/LoadingSpinner';

type Props = {
  showPrompt: boolean;
};

type State = {
  isReloading: boolean;
};

class RefreshPrompt extends React.PureComponent<Props, State> {
  buttonWidth?: number;

  buttonRef = React.createRef<HTMLButtonElement>();

  state = {
    isReloading: false,
  };

  onReload = () => {
    // Preserve the button's width so the button doesn't shrink when
    // we replace the text with the loading spinner
    const button = this.buttonRef.current;
    if (button) {
      this.buttonWidth = button.offsetWidth;
    }

    this.setState({ isReloading: true });
    updateServiceWorker();
  };

  render() {
    if (!this.props.showPrompt) {
      return null;
    }

    const { isReloading } = this.state;

    return (
      <div className={classnames('alert alert-success', styles.announcement, styles.wrapButtons)}>
        <Refresh className={styles.backgroundIcon} />

        <div className={styles.body}>
          <h3>A new version of NUSMods is available</h3>
          <p>Please refresh the page to get the latest version.</p>
        </div>

        <div className={styles.buttons}>
          <button
            className="btn btn-success"
            type="button"
            onClick={this.onReload}
            style={{ width: this.buttonWidth }}
            disabled={isReloading}
            ref={this.buttonRef}
          >
            {isReloading ? <LoadingSpinner small /> : 'Refresh page'}
          </button>
        </div>
      </div>
    );
  }
}

export default connect((state: StoreState) => ({
  showPrompt: state.app.promptRefresh,
}))(RefreshPrompt);
