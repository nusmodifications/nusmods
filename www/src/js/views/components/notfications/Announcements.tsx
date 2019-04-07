import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import config from 'config';
import storage from 'storage';
import { announcementKey } from 'storage/keys';
import { toggleFeedback } from 'actions/app';
import { Heart } from 'views/components/icons';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';
import styles from './Announcements.scss';

type Props = {
  toggleFeedback: Function;
};

type State = {
  isOpen: boolean;
};

/**
 * Unique string for the current announcement. If the announcement is not dismissible,
 * set the key to null.
 *
 * Previous keys:
 * - 'nusmods-is-official' - NUSMods switch to official APIs
 * - 'nusmods-r-announcement' - NUSMods R announcement message
 * - 'ay201819-new-data' - AY2018/19 data is available
 * - 'ay201819-s2-new-data' - S2 data available
 */
const key = announcementKey('nusmods-is-official');

class Announcements extends React.PureComponent<Props, State> {
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
          <h3>
            NUSMods{' '}
            <span role="img" aria-label="hearts">
              ❤️
            </span>{' '}
            NUS
          </h3>
          <p>
            We&apos;re official! NUSMods now uses data provided directly by NUS Registrar&apos;s
            Office and NUSIT, which means better and more accurate information for you.{' '}
            <ExternalLink href={`${config.contact.blog}/title`}>Learn more.</ExternalLink>
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
