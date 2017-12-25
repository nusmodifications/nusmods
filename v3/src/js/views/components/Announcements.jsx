// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import storage from 'storage';
import { Heart } from 'views/components/icons';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

type Props = {};
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

export default class Announcements extends PureComponent<Props, State> {
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
      <div className={classnames('alert alert-success', styles.announcement)}>
        <Heart className={styles.backgroundIcon} />

        <div className={styles.body}>
          <h3>Welcome to NUSMods R!</h3>
          <p>New and improved, just in time for the second semester.{' '}
            <a href="">Check out what&apos;s new</a>, and{' '}
            <a href="">tell us what you think</a>.</p>
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
