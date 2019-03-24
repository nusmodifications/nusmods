import * as React from 'react';
import { connect } from 'react-redux';

import config from 'config';
import { toggleFeedback } from 'actions/app';
import { State } from 'types/state';
import ExternalLink from './ExternalLink';
import { Heart, GitHub, Facebook, Mail } from './icons';
import CloseButton from './CloseButton';
import Modal from './Modal';
import styles from './FeedbackModal.scss';

type Props = {
  isOpen: boolean;
  toggleFeedback: () => void;
};

export function FeedbackButtons() {
  return (
    <div>
      <div className={styles.links}>
        <ExternalLink className={styles.messenger} href={config.contact.messenger}>
          <Facebook />
          Messenger
        </ExternalLink>
        <ExternalLink className={styles.github} href={config.contact.githubRepo}>
          <GitHub />
          GitHub
        </ExternalLink>
        <ExternalLink className={styles.email} href={`mailto:${config.contact.email}`}>
          <Mail />
          Email
        </ExternalLink>
      </div>
      <p className="text-muted">
        To email us privately, such as for security issues, please use{' '}
        <ExternalLink href={`mailto:${config.contact.privateEmail}`}>
          {config.contact.privateEmail}
        </ExternalLink>
      </p>
    </div>
  );
}

export class FeedbackModalComponent extends React.PureComponent<Props> {
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
