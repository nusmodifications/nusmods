// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import storage from 'storage';
import { announcementKey } from 'storage/keys';
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

/**
 * Unique string for the current announcement. If the announcement is not dismissible,
 * set the key to null.
 *
 * Previous keys:
 * - 'nusmods-r-announcement' - NUSMods R announcement message
 * - 'ay201819-new-data' - AY2018/19 data is available
 * - 'ay201819-s2-new-data' - S2 data available
 */
const key = announcementKey('ay201819-s2-new-data');

class Announcements extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      // Set to constant false to turn off announcement
      isOpen: key ? !storage.getItem(key) : true,
    };
  }

  dismiss = () => {
    if (key) storage.setItem(key, true);
    this.setState({ isOpen: false });
  };

  render() {
    if (!this.state.isOpen) return null;

    return (
      <div className={classnames('alert alert-success no-export', styles.announcement)}>
        <Heart className={styles.backgroundIcon} />

        <div className={styles.body}>
          <h3>Semester 2 modules now available</h3>
          <p>
            CORS has been updated with lesson timetables. Please note that these can change at any
            time during the holidays, so check back often. Happy planning!
          </p>
        </div>

        {key && <CloseButton className={styles.closeButton} onClick={this.dismiss} />}
      </div>
    );
  }
}

export default connect(
  null,
  { toggleFeedback },
)(Announcements);
