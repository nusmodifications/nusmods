// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import storage from 'storage';
import { toggleFeedback } from 'actions/app';
import { Heart } from 'views/components/icons';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

type Props = {
  toggleFeedback: Function,
};
type State = {
  isOpen: boolean,
};

const STORAGE_PREFIX = 'announcements.';

/**
 * Unique string for the current announcement. If the announcement is not dismissible,
 * set the key to an empty string.
 *
 * Previous keys:
 * - 'nusmods-r-announcement' - NUSMods R announcement message
 */
const STORAGE_KEY = 'nusmods-r-announcement';

const KEY = `${STORAGE_PREFIX}${STORAGE_KEY}`;

class Announcements extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: !storage.getItem(KEY),
    };
  }

  dismiss = () => {
    storage.setItem(KEY, true);
    this.setState({ isOpen: false });
  };

  render() {
    if (!this.state.isOpen) return null;

    return (
      <div className={classnames('alert alert-warning', styles.announcement)}>
        <Heart className={styles.backgroundIcon} />

        <div className={styles.body}>
          <h3>Welcome to NUSMods R!</h3>
          <p>New and improved, just in time for the second semester.{' '}
            <a
              href="http://blog.nusmods.com/nusmods-r-rethought-redesigned-rewritten-reborn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Check out what&apos;s new
            </a>, and{' '}
            <button
              className="btn btn-inline"
              type="button"
              onClick={this.props.toggleFeedback}
            >tell us what you think</button>.</p>
        </div>

        {STORAGE_KEY &&
          <CloseButton
            className={styles.closeButton}
            onClick={this.dismiss}
          />}
      </div>
    );
  }
}

export default connect(null, { toggleFeedback })(Announcements);
