// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State } from 'reducers';

import config from 'config';
import { toggleFeedback } from 'actions/app';
import ExternalLink from './ExternalLink';
import { HeartIcon, GitHubIcon, FacebookIcon, MailIcon } from './icons';
import CloseButton from './CloseButton';
import Modal from './Modal';
import styles from './FeedbackModal.scss';

type Props = {
  isOpen: boolean,
  toggleFeedback: Function,
};

export function FeedbackButtons() {
  return (
    <div className={styles.links}>
      <ExternalLink className={styles.messenger} href={config.contact.messenger}>
        <FacebookIcon />
        Messenger
      </ExternalLink>
      <ExternalLink className={styles.github} href={config.contact.githubRepo}>
        <GitHubIcon />
        GitHub
      </ExternalLink>
      <ExternalLink className={styles.form} href="mailto:mods@nusmods.com">
        <MailIcon />
        Email
      </ExternalLink>
    </div>
  );
}

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
          <HeartIcon className={styles.topIcon} />
          <h1>Let us know what you think!</h1>
          <p>
            Thank you for your time! You can talk to us on Messenger, file an issue on GitHub, or
            send us an email.
          </p>
          <FeedbackButtons />
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
