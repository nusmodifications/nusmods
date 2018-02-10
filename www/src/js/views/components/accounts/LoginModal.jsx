// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import firebaseui from 'firebaseui';

import type { State } from 'reducers';

import { toggleLoginDialog } from 'actions/app';
import { auth } from 'utils/firebase';

// import { GitHub, Facebook, Mail } from './icons';
import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import FirebaseAuth from './FirebaseAuth';
// import styles from './LoginModal.scss';

type Props = {
  isOpen: boolean,
  toggleLoginDialog: Function,
};

export class LoginModalComponent extends PureComponent<Props> {
  uiConfig: Object;

  constructor(props: Props) {
    super(props);
    this.uiConfig = {
      signInFlow: 'popup',
      signInOptions: [
        auth.EmailAuthProvider.PROVIDER_ID,
        auth.GoogleAuthProvider.PROVIDER_ID,
        auth.FacebookAuthProvider.PROVIDER_ID,
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      callbacks: {
        signInSuccess: () => props.toggleLoginDialog(),
      },
    };
  }

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
          <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={auth()} />
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
