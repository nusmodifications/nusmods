// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State } from 'reducers';

import { toggleFeedback } from 'actions/app';
import { Heart, GitHub, MessageCircle, Mail } from './icons';
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
      <Modal isOpen={this.props.isOpen} onRequestClose={this.props.toggleFeedback}>
        <CloseButton onClick={this.props.toggleFeedback} />
        <div className={styles.content}>
          <Heart className={styles.topIcon} />
          <h1>Tell us what you think</h1>
          <p>Thank you for your time! You can talk to us on Messenger, file
            an issue on GitHub, or fill up a feedback form</p>

          <div className={styles.links}>
            <a
              className={styles.messenger}
              href="https://www.m.me/nusmods"
              target="_blank"
              rel="noreferrer noopener"
            >
              <MessageCircle />
              Messenger
            </a>
            <a
              className={styles.github}
              href="https://github.com/nusmodifications/nusmods/issues"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GitHub />
              GitHub
            </a>
            <a className={styles.form} href="">
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
