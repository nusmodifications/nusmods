// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import firebaseui from 'firebaseui';

import type { User as FirebaseUser } from '@firebase/app';
import type { State } from 'reducers';
import type { User } from 'types/reducers';

import { toggleLoginDialog } from 'actions/app';
import { login } from 'actions/auth';
import { auth } from 'utils/firebase/firebase';

// import { GitHub, Facebook, Mail } from './icons';
import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import FirebaseAuth from './FirebaseAuth';
// import styles from './LoginModal.scss';

type Props = {
  isOpen: boolean,
  toggleLoginDialog: Function,
  login: Function,
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
        signInSuccess: (currentUser: FirebaseUser) => {
          const user: User = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoUrl: currentUser.photoURL,
            providerId: currentUser.providerId,
          };
          props.login(user, currentUser);
        },
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
  { toggleLoginDialog, login },
)(LoginModalComponent);
