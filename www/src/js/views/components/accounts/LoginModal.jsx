// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State as StoreState } from 'reducers';

import config from 'config';

import { toggleLoginDialog } from 'actions/app';
import { signInUser } from 'actions/auth';

// import { GitHub, Facebook, Mail } from './icons';
import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import ExternalLink from 'views/components/ExternalLink';
// import styles from './LoginModal.scss';

type State = {
  email: string,
  password: string,
  errorMessage: ?string,
};

type Props = {
  isOpen: boolean,
  isLoading: boolean,
  toggleLoginDialog: Function,
  signInUser: Function,
};

export class LoginModalComponent extends PureComponent<Props, State> {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
  }

  signIn = (e) => {
    e.preventDefault();
    this.setState({ errorMessage: null });
    const authPayload = { email: this.state.email, password: this.state.password };
    return this.props
      .signInUser(authPayload)
      .then(() => {
        this.props.toggleLoginDialog();
      })
      .catch(() => {
        // TODO: Handle other errors (e.g. network errors)
        this.setState({ errorMessage: 'Wrong email or password.' });
      });
  };

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
          <hr />
          {this.state.errorMessage && (
            <div className="alert alert-warning fade show" role="alert">
              {this.state.errorMessage}{' '}
              <span role="img" aria-label="loudly crying face">
                😭
              </span>
            </div>
          )}
          <form>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                id="emailInput"
                aria-describedby="emailHelp"
                placeholder="Email"
                disabled={this.props.isLoading}
                value={this.state.email}
                onChange={(e) => this.setState({ email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                id="passwordInput"
                placeholder="Password"
                disabled={this.props.isLoading}
                value={this.state.password}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              onClick={this.signIn}
              disabled={this.props.isLoading}
            >
              Sign In
            </button>
            <ExternalLink
              href={`${config.railsApiBaseUrl}/users/sign_up`}
              className="btn btn-link btn-block"
              disabled={this.props.isLoading}
            >
              Register
            </ExternalLink>
            <ExternalLink
              href={`${config.railsApiBaseUrl}/users/password/new`}
              className="btn btn-link btn-block"
              disabled={this.props.isLoading}
            >
              Forgot password
            </ExternalLink>
          </form>
        </div>
      </Modal>
    );
  }
}

export default connect(
  (state: StoreState) => ({
    isOpen: state.app.isLoginModalOpen,
    isLoading: state.reduxTokenAuth.currentUser.isLoading,
  }),
  { toggleLoginDialog, signInUser },
)(LoginModalComponent);
