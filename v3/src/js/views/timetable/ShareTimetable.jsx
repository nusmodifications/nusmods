// @flow

import React, { PureComponent } from 'react';
import { QRCode } from 'react-qr-svg';
import classnames from 'classnames';
import qs from 'query-string';
import axios from 'axios';

import type { SemTimetableConfig } from 'types/timetables';
import type { Semester } from 'types/modules';

import config from 'config';
import { absolutePath, timetableShare } from 'views/routes/paths';
import { Repeat, Copy, Mail } from 'views/components/icons';
import Modal from 'views/components/Modal';
import LoadingSpinner from 'views/components/LoadingSpinner';

import styles from './ShareTimetable.scss';
import actionStyles from './TimetableActions.scss';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,
};

type State = {
  isOpen: boolean,
  shortUrl: ?string,
};

function shareUrl(semester: Semester, timetable: SemTimetableConfig): string {
  return absolutePath(timetableShare(semester, timetable));
}

export default class ShareTimetable extends PureComponent<Props, State> {
  urlInput: ?HTMLInputElement;
  url: ?string;

  state: State = {
    isOpen: false,
    shortUrl: null,
  };

  loadShortUrl(url: string) {
    return axios.get('https://nusmods.com/short_url.php', { data: { url } })
      .then(({ data }) => this.setState({ shortUrl: data.shortUrl }))
      // Cannot get short URL - just use long URL instead
      .catch(() => this.setState({ shortUrl: url }));
  }

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

  renderSharing(url: string) {
    const { semester } = this.props;

    return (
      <div>
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
              <Copy className={styles.icon} />
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

            <a
              className="btn btn-outline-primary btn-block"
              href={`mailto:?${qs.stringify({
                subject: 'NUSMods timetable',
                body: `My timetable for ${config.academicYear} ${config.semesterNames[semester]}` +
                ` can be found at ${url}`,
              })}`}
            ><Mail className={styles.icon} /> Send Email</a>
          </div>
          <div className="col-sm-4">
            <h3 className={styles.shareHeading}>Via messaging apps</h3>

            <a
              className="btn btn-outline-primary btn-block"
              href={`https://api.whatsapp.com/send?${qs.stringify({ text: `My timetable: ${url}` })}`}
              target="_blank"
              rel="noreferrer noopener"
            >WhatsApp</a>

            <a
              className="btn btn-outline-primary btn-block"
              href={`https://t.me/share/url?${qs.stringify({ url })}`}
              target="_blank"
              rel="noreferrer noopener"
            >Telegram</a>
          </div>
        </div>
      </div>
    );
  }

  // Event handlers
  openModal = () => {
    const { semester, timetable } = this.props;
    const nextUrl = shareUrl(semester, timetable);

    if (this.url !== nextUrl) {
      this.url = nextUrl;
      this.loadShortUrl(nextUrl);
      this.setState({ shortUrl: null });
    }

    this.setState({ isOpen: true });
  };

  render() {
    const { isOpen, shortUrl } = this.state;

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

          {shortUrl ? this.renderSharing(shortUrl) : <LoadingSpinner />}
        </Modal>
      </div>
    );
  }
}
