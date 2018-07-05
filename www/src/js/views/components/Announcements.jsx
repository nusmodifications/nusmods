// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import storage from 'storage';
// import { announcementKey } from 'storage/keys';
import { toggleFeedback } from 'actions/app';
import { AlertTriangle } from 'views/components/icons';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';
import ExternalLink from './ExternalLink';

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
 */
const key = null;

class Announcements extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: true, // !storage.getItem(key),
    };
  }

  dismiss = () => {
    if (key) storage.setItem(key, true);
    this.setState({ isOpen: false });
  };

  render() {
    if (!this.state.isOpen) return null;

    return (
      <div className={classnames('alert alert-warning no-export', styles.announcement)}>
        <AlertTriangle className={styles.backgroundIcon} />

        <div className={styles.body}>
          <h3>No module information for AY2019/20 yet</h3>
          <p>
            CORS and IVLE have not been updated with next semester&apos;s information yet.
            We&apos;ll update as soon as they become available. For now please refer to the
            individual faculty&apos;s module list:
          </p>
          <ul>
            <li>
              <ExternalLink href="http://www.comp.nus.edu.sg/cugresource/soc-sched/">
                School of Computing
              </ExternalLink>
            </li>
          </ul>
        </div>

        {key && <CloseButton className={styles.closeButton} onClick={this.dismiss} />}
      </div>
    );
  }
}

export default connect(null, { toggleFeedback })(Announcements);
