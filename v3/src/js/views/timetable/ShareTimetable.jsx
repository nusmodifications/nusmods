// @flow

import React, { PureComponent } from 'react';
import { QRCode } from 'react-qr-svg';
import classnames from 'classnames';

import type { SemTimetableConfig } from 'types/timetables';
import type { Semester } from 'types/modules';

import { absolutePath, timetableShare } from 'views/routes/paths';
import { Repeat, Copy } from 'views/components/icons';
import Modal from 'views/components/Modal';

import styles from './ShareTimetable.scss';
import actionStyles from './TimetableActions.scss';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,
};

type State = {
  isOpen: boolean,
};

export default class ShareTimetable extends PureComponent<Props, State> {
  urlInput: ?HTMLInputElement;

  state: State = {
    isOpen: false,
  };

  openModal = () => this.setState({ isOpen: true });
  closeModal = () => this.setState({ isOpen: false });

  copyText = () => {
    const input = this.urlInput;

    if (input) {
      input.select();
      input.setSelectionRange(0, input.value.length);

      // TODO: Inform the user copy succeeded through the UI, and prompt the user
      // to manually copy if execCommand fails. Mobile Safari currently doesn't support
      // execCommand('copy')
      if (document.execCommand('copy')) {
        input.blur();
      }
    }
  };

  render() {
    const { isOpen } = this.state;
    const { semester, timetable } = this.props;
    const url = absolutePath(timetableShare(semester, timetable));

    return (
      <div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={this.openModal}
        >
          <Repeat className={actionStyles.actionIcon} />
          Share/Sync
        </button>

        <Modal isOpen={isOpen} onRequestClose={this.closeModal}>
          <div className={styles.header}>
            <Repeat />

            <h3>Share/Sync Your Timetable</h3>
            <p>Send this link to your friends to share your timetable or <br />
              to yourself to keep your timetable synced on all devices.</p>
          </div>

          <div className="input-group input-group-lg">
            <input
              value={url}
              className={classnames('form-control', styles.url)}
              ref={(r) => { this.urlInput = r; }}
              readOnly
            />
            <span className="input-group-btn">
              <button
                className="btn btn-primary"
                type="button"
                aria-label="Copy URL"
                onClick={this.copyText}
              >
                <Copy className={styles.copyIcon} />
              </button>
            </span>
          </div>

          <div className="row">
            <div className="col-sm-4">
              <h3 className={styles.shareHeading}>QR Code</h3>

              <div className={styles.qrCode}>
                <QRCode value={url} />
              </div>
            </div>
            <div className="col-sm-4">
              <h3 className={styles.shareHeading}>Via email</h3>
            </div>
            <div className="col-sm-4">
              <h3 className={styles.shareHeading}>Via messaging apps</h3>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
