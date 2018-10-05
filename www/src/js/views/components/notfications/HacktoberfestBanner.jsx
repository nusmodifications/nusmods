// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

import storage from 'storage';
import { HACKTOBERFEST } from 'storage/keys';
import styles from 'views/components/notfications/Announcements.scss';
import Heart from 'react-feather/dist/icons/heart';
import CloseButton from 'views/components/CloseButton';

type Props = {};
type State = {
  isOpen: boolean,
};

export default class HacktoberfestBanner extends PureComponent<Props, State> {
  state: State = {
    isOpen: !storage.getItem(HACKTOBERFEST) && new Date().getMonth() === 9,
  };

  dismiss = () => {
    storage.setItem(HACKTOBERFEST, true);
    this.setState({ isOpen: false });
  };

  render() {
    if (!this.state.isOpen) return null;

    return (
      <div className={classnames('alert alert-info no-export', styles.announcement)}>
        <Heart className={styles.backgroundIcon} />

        <div className={styles.body}>
          <h3>Hacktoberfest 2018 now open!</h3>
          <p>
            Improve NUSMods by submitting pull requests and get a free T-shirt at the same time!
          </p>
        </div>

        <div className={styles.buttons}>
          <Link to="/hacktoberfest" className="btn btn-lg btn-info">
            Find out more
          </Link>

          <CloseButton className={styles.closeButton} onClick={this.dismiss} />
        </div>
      </div>
    );
  }
}
