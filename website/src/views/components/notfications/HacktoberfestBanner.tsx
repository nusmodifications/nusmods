import React from 'react';
import classnames from 'classnames';
import Link from 'views/routes/Link';

import type { EmptyProps } from 'types/utils';
import storage from 'storage';
import { HACKTOBERFEST } from 'storage/keys';
import { Heart } from 'react-feather';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

type Props = EmptyProps;
type State = {
  isOpen: boolean;
};

const today = new Date();

export default class HacktoberfestBanner extends React.PureComponent<Props, State> {
  state: State = {
    isOpen: !storage.getItem(HACKTOBERFEST) && (today.getMonth() === 9 || today.getMonth() === 10),
  };

  dismiss = () => {
    storage.setItem(HACKTOBERFEST, true);
    this.setState({ isOpen: false });
  };

  render() {
    if (!this.state.isOpen) return null;

    return (
      <div
        className={classnames(
          'alert alert-info no-export',
          styles.announcement,
          styles.hacktoberfest,
        )}
      >
        <Heart className={styles.backgroundIcon} />

        <div className={styles.body}>
          <h3>Hacktoberfest 2018 now open!</h3>
          <p>Improve NUSMods by writing code and get free T-shirts at the same time!</p>
        </div>

        <div className={styles.buttons}>
          <Link to="/hacktoberfest" className="btn btn-info">
            Find out more
          </Link>

          <CloseButton className={styles.closeButton} onClick={this.dismiss} />
        </div>
      </div>
    );
  }
}
