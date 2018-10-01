// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';

import storage from 'storage';
import { HACKTOBERFEST } from 'storage/keys';
import styles from 'views/components/notfications/Announcements.scss';
import Heart from 'react-feather/dist/icons/heart';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';

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
            Improve NUSMods by{' '}
            <ExternalLink href="https://github.com/nusmodifications/nusmods/issues?q=is%3Aissue+is%3Aopen+label%3AHacktoberfest">
              submitting pull requests
            </ExternalLink>{' '}
            and{' '}
            <ExternalLink href="https://hacktoberfest.digitalocean.com/">
              get a free T-shirt
            </ExternalLink>{' '}
            at the same time!
          </p>
        </div>

        <CloseButton className={styles.closeButton} onClick={this.dismiss} />
      </div>
    );
  }
}
