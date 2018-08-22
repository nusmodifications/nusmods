// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State } from 'reducers';

import { toggleLoginDialog } from 'actions/app';

// import { GitHub, Facebook, Mail } from './icons';
import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
// import styles from './LoginModal.scss';

type Props = {
  isOpen: boolean,
  toggleLoginDialog: Function,
};

export class LoginModalComponent extends PureComponent<Props> {
  render() {
    return (
      <Modal isOpen={this.props.isOpen} onRequestClose={this.props.toggleLoginDialog}>
        <CloseButton onClick={this.props.toggleLoginDialog} />
        <div>
          <h1>Sign In</h1>
          <p>
            Welcome to NUSMods! Signing in to NUSMods will allow you to sync your timetable between
            your devices.
          </p>
          <h3>TODO: Login component</h3>
        </div>
      </Modal>
    );
  }
}

export default connect(
  (state: State) => ({
    isOpen: state.app.isLoginModalOpen,
  }),
  { toggleLoginDialog },
)(LoginModalComponent);
