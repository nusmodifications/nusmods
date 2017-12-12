// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import select from 'select';

import type { SemTimetableConfig } from 'types/timetables';
import type { Semester } from 'types/modules';

import { absolutePath, timetableAction } from 'views/routes/paths';
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
    action: 'sync',
  };

  openModal = () => this.setState({ isOpen: true });
  closeModal = () => this.setState({ isOpen: false });

  copyText = () => {
    if (this.urlInput) {
      select(this.urlInput);
      document.execCommand('copy');
    }
  };

  render() {
    const { isOpen } = this.state;
    const { semester, timetable } = this.props;
    const url = absolutePath(timetableAction(semester, timetable));

    return (
      <div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={this.openModal}
        >
          <Repeat className={actionStyles.actionIcon} />
          Share
        </button>

        <Modal isOpen={isOpen} onRequestClose={this.closeModal}>
          <div className={styles.header}>
            <Repeat />

            <h3>Share or Sync Your Timetable</h3>
            <p>Send this link to your friends to share your timetable
              or to yourself to keep your timetable synced on all devices.</p>
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
        </Modal>
      </div>
    );
  }
}
