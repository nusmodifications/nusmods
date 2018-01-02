// @flow

import React, { PureComponent } from 'react';
import { MDCSnackbar } from '@material/snackbar';
import type { NotificationData } from 'types/reducers';

type Props = {
  notification: ?NotificationData,
};

export default class Notification extends PureComponent<Props> {
  element: ?HTMLElement;
  snackbar: ?MDCSnackbar;

  componentDidMount() {
    if (this.element) {
      this.snackbar = new MDCSnackbar(this.element);

      if (this.props.notification) {
        this.showSnackbar();
      }
    }
  }

  componentDidUpdate() {
    if (this.props.notification) {
      this.showSnackbar();
    }
  }

  componentWillUnmount() {
    if (this.snackbar) {
      this.snackbar.destroy();
    }
  }

  showSnackbar() {
    if (this.snackbar && this.props.notification) {
      const { message, timeoutInMs, action, multiline } = this.props.notification;
      const actionParams = action ? { actionText: action.text, actionHandler: action.handler } : {};

      this.snackbar.show({
        multiline,
        message,
        timeout: timeoutInMs,
        ...actionParams,
      });
    }
  }

  render() {
    return (
      <div
        className="mdc-snackbar"
        aria-live="assertive"
        aria-atomic="true"
        aria-hidden="true"
        ref={(r) => {
          this.element = r;
        }}
      >
        <div className="mdc-snackbar__text" />
        <div className="mdc-snackbar__action-wrapper">
          <button type="button" className="mdc-snackbar__action-button" />
        </div>
      </div>
    );
  }
}
