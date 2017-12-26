// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State } from 'reducers';

import config from 'config';
import { toggleFeedback } from 'actions/app';
import { Heart, GitHub, Facebook, Mail } from './icons';
import CloseButton from './CloseButton';
import Modal from './Modal';
import styles from './FeedbackModal.scss';

type Props = {
  isOpen: boolean,
  toggleFeedback: Function,
};

export class FeedbackModalComponent extends PureComponent<Props> {
  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.toggleFeedback}
        className={styles.modal}
      >
        <CloseButton onClick={this.props.toggleFeedback} />
        <div className={styles.content}>
          <Heart className={styles.topIcon} />
          <h1>Talk to us!</h1>
          <p>Thank you for your time! You can talk to us on Messenger, file
            an issue on GitHub, or fill up a feedback form</p>

          <div className={styles.links}>
            <a
              className={styles.messenger}
              href={config.contact.facebook}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Facebook />
              Messenger
            </a>
            <a
              className={styles.github}
              href={config.contact.githubRepo}
              target="_blank"
              rel="noreferrer noopener"
            >
              <GitHub />
              GitHub
            </a>
            <a
              className={styles.form}
              href=""
              target="_blank"
              rel="noreferrer noopener"
            >
              <Mail />
              Feedback Form
            </a>
          </div>
        </div>
      </Modal>
    );
  }
}

export default connect((state: State) => ({
  isOpen: state.app.isFeedbackModalOpen,
}), { toggleFeedback })(FeedbackModalComponent);
