// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State } from 'reducers';

import config from 'config';
import { toggleFeedback } from 'actions/app';
import ExternalLink from './ExternalLink';
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
        animate
      >
        <CloseButton absolutePositioned onClick={this.props.toggleFeedback} />
        <div className={styles.content}>
          <Heart className={styles.topIcon} />
          <h1>Let us know what you think!</h1>
          <p>
            Thank you for your time! You can talk to us on Messenger, file an issue on GitHub, or
            fill up a short feedback form (takes you less than 3 minutes).
          </p>
          <div className={styles.links}>
            <ExternalLink className={styles.messenger} href={config.contact.messenger}>
              <Facebook />
              Messenger
            </ExternalLink>
            <ExternalLink className={styles.github} href={config.contact.githubRepo}>
              <GitHub />
              GitHub
            </ExternalLink>
            <ExternalLink className={styles.form} href="https://goo.gl/forms/iZd8uVXAiJfu8D6e2">
              <Mail />
              Feedback Form
            </ExternalLink>
          </div>
        </div>
      </Modal>
    );
  }
}

export default connect(
  (state: State) => ({
    isOpen: state.app.isFeedbackModalOpen,
  }),
  { toggleFeedback },
)(FeedbackModalComponent);
