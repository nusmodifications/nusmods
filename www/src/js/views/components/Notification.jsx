// @flow

import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import type { State as StoreState } from 'reducers';
import type { NotificationData } from 'types/reducers';
import { popNotification } from 'actions/app';
import styles from './Notification.scss';

type Props = {
  notifications: NotificationData[],
  popNotification: () => void,
};

type State = {
  isOpen: boolean,
  shownNotification: ?NotificationData,
};

const ACTIVE_CLASSNAME = 'mdc-snackbar--active';
const DEFAULT_TIMEOUT = 2750;

export class NotificationComponent extends Component<Props, State> {
  element: ?HTMLElement;
  timeoutId: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      shownNotification: props.notifications[0],
      isOpen: !!props.notifications.length,
    };
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      nextProps.notifications[0] !== this.state.shownNotification ||
      nextState.isOpen !== this.state.isOpen
    );
  }

  componentDidUpdate() {
    // Active notification has changed
    if (this.props.notifications[0] !== this.state.shownNotification) {
      if (this.state.isOpen) {
        this.closeSnackbar();
      } else if (!this.transitioning) {
        this.openSnackbar();
      }
    }
  }

  onTransitionEnd = (evt: TransitionEvent) => {
    if (evt.target !== this.element) return;

    this.transitioning = false;

    if (this.state.isOpen && this.state.shownNotification) {
      // This is at the end of the opening transition, so we set a timer and
      // close the notification when the timer is up
      const timeout = this.state.shownNotification.timeout || DEFAULT_TIMEOUT;

      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => this.props.popNotification(), timeout);
    } else if (this.props.notifications.length) {
      // End of closing transition - if there are more notifications, let's show them
      this.openSnackbar();
    }
  };

  transitioning: boolean = false;

  openSnackbar = () => {
    this.transitioning = true;
    this.setState({ isOpen: true, shownNotification: this.props.notifications[0] });
  };

  closeSnackbar = () => {
    this.transitioning = true;
    clearTimeout(this.timeoutId);
    this.setState({ isOpen: false });
  };

  render() {
    const { shownNotification, isOpen } = this.state;

    return (
      <div
        className={classnames('mdc-snackbar', styles.snackbar, {
          [ACTIVE_CLASSNAME]: isOpen,
        })}
        aria-live="assertive"
        aria-atomic="true"
        aria-hidden={!!shownNotification}
        onTransitionEnd={this.onTransitionEnd}
        ref={(r) => {
          this.element = r;
        }}
      >
        {shownNotification ? (
          <Fragment>
            <div className="mdc-snackbar__text">{shownNotification.message}</div>
            {shownNotification.action && (
              <div className="mdc-snackbar__action-wrapper">
                <button
                  type="button"
                  className="mdc-snackbar__action-button"
                  onClick={shownNotification.action.handler}
                >
                  {shownNotification.action.text}
                </button>
              </div>
            )}
          </Fragment>
        ) : null}
      </div>
    );
  }
}

export default connect(
  (state: StoreState) => ({
    notifications: state.app.notifications,
  }),
  { popNotification },
)(NotificationComponent);
