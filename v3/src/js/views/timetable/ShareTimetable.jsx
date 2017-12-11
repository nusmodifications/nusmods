// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';
import select from 'select';
import { capitalize } from 'lodash';

import type { TimetableAction } from 'types/views';
import type { SemTimetableConfig } from 'types/timetables';
import type { Semester } from 'types/modules';

import { TIMETABLE_SHARE } from 'types/views';
import { timetableAction } from 'views/routes/paths';
import { Share, Repeat, Copy } from 'views/components/icons';
import Modal from 'views/components/Modal';

import styles from './ShareTimetable.scss';
import actionStyles from './TimetableActions.scss';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,
};

type State = {
  isOpen: boolean,
  action: TimetableAction,
};

export default class ShareTimetable extends PureComponent<Props, State> {
  urlInput: ?HTMLInputElement;

  state: State = {
    isOpen: false,
    action: 'sync',
  };

  openModal(action: TimetableAction) {
    this.setState({
      isOpen: true,
      action,
    });
  }

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  copyText = () => {
    if (this.urlInput) {
      select(this.urlInput);
      document.execCommand('copy');
    }
  };

  render() {
    const { isOpen, action } = this.state;
    const { semester, timetable } = this.props;

    const url = `${location.protocol}//${location.host}${timetableAction(semester, action, timetable)}`;
    const isSharing = action === TIMETABLE_SHARE;

    return (
      <div>
        <div className="btn-group btn-group-sm" role="group" aria-label="Timetable sharing">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => this.openModal('share')}
          >
            <Share className={actionStyles.actionIcon} />
            Share
          </button>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => this.openModal('sync')}
          >
            <Repeat className={actionStyles.actionIcon} />
            Sync
          </button>
        </div>

        <Modal
          isOpen={isOpen}
          className={classnames(action)}
          onRequestClose={this.closeModal}
        >
          <div className={styles.header}>
            {isSharing ? <Share /> : <Repeat />}

            <h3>{capitalize(action)} Your Timetable</h3>
            <p>Send this link to {isSharing ? 'your friends' : 'yourself'}</p>
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
