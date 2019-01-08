// @flow

import React, { PureComponent, Fragment } from 'react';
import classnames from 'classnames';
import qs from 'query-string';
import axios from 'axios';

import type { SemTimetableConfig } from 'types/timetables';
import type { Semester } from 'types/modules';

import config from 'config';
import { absolutePath, timetableShare } from 'views/routes/paths';
import { Repeat, Copy, Mail } from 'views/components/icons';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import LoadingSpinner from 'views/components/LoadingSpinner';

import styles from './ShareTimetable.scss';

type CopyState = 'NOT_COPIED' | 'COPY_SUCCESS' | 'COPY_FAIL';
const NOT_COPIED: CopyState = 'NOT_COPIED';
const COPY_SUCCESS: CopyState = 'COPY_SUCCESS';
const COPY_FAIL: CopyState = 'COPY_FAIL';

type Props = {
  semester: Semester,
  timetable: SemTimetableConfig,
};

type State = {
  isOpen: boolean,
  urlCopied: CopyState,
  shortUrl: ?string,
};

function shareUrl(semester: Semester, timetable: SemTimetableConfig): string {
  return absolutePath(timetableShare(semester, timetable));
}

// So that I don't keep typing 'shortUrl' instead
export const SHORT_URL_KEY = 'shorturl';

export default class ShareTimetable extends PureComponent<Props, State> {
  // Save a copy of the current URL to detect when URL changes
  url: ?string;

  // React QR component is lazy loaded for performance
  static QRCode: ?ComponentType<any>;

  state: State = {
    isOpen: false,
    urlCopied: NOT_COPIED,
    shortUrl: null,
  };

  componentDidMount() {
    if (!ShareTimetable.QRCode) {
      import(/* webpackChunkName: "export" */ 'react-qr-svg').then((module) => {
        ShareTimetable.QRCode = module.QRCode;
        this.forceUpdate();
      });
    }
  }

  urlInput = React.createRef<HTMLInputElement>();

  loadShortUrl = () => {
    const { semester, timetable } = this.props;
    const url = shareUrl(semester, timetable);

    // Don't do anything if the long URL has not changed
    if (this.url === url) return;

    const showFullUrl = () => this.setState({ shortUrl: url });
    this.url = url;

    // Only try to retrieve shortUrl if the user is online
    if (!navigator.onLine) {
      showFullUrl();
      return;
    }

    this.setState({ shortUrl: null });

    axios
      .get('/short_url.php', { params: { url }, timeout: 2000 })
      .then(({ data }) => {
        if (data[SHORT_URL_KEY]) {
          this.setState({ shortUrl: data[SHORT_URL_KEY] });
        } else {
          showFullUrl();
        }
      })
      // Cannot get short URL - just use long URL instead
      .catch(showFullUrl);
  };

  openModal = () => {
    this.loadShortUrl();
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false,
      urlCopied: NOT_COPIED,
    });

  copyText = () => {
    const input = this.urlInput.current;

    if (input) {
      input.select();
      input.setSelectionRange(0, input.value.length);

      if (document.execCommand('copy')) {
        input.blur();
        this.setState({ urlCopied: COPY_SUCCESS });
      } else {
        this.setState({ urlCopied: COPY_FAIL });
      }
    }
  };

  renderSharing(url: string) {
    const { semester } = this.props;

    return (
      <div>
        <div className={classnames('input-group input-group-lg', styles.linkInputGroup)}>
          <input
            value={url}
            className={classnames('form-control', styles.url)}
            ref={this.urlInput}
            readOnly
          />
          <div className="input-group-append">
            <button
              className="btn btn-primary"
              type="button"
              aria-label="Copy URL"
              onClick={this.copyText}
            >
              <Copy className={styles.copyIcon} />
            </button>
          </div>

          {this.state.urlCopied === COPY_SUCCESS && (
            <p className={styles.copyStatus}>Link copied!</p>
          )}
          {this.state.urlCopied === COPY_FAIL && (
            <p className={styles.copyStatus}>Press Cmd/Ctrl + C to copy</p>
          )}
        </div>

        <div className="row">
          <div className="col-sm-4">
            <h3 className={styles.shareHeading}>QR Code</h3>
            <div className={styles.qrCode}>
              {ShareTimetable.QRCode && <ShareTimetable.QRCode value={url} />}
            </div>
          </div>
          <div className="col-sm-4">
            <h3 className={styles.shareHeading}>Via email</h3>

            <a
              className="btn btn-outline-primary btn-block btn-svg"
              href={`mailto:?${qs.stringify({
                subject: 'NUSMods timetable',
                body:
                  `My timetable for ${config.academicYear} ${config.semesterNames[semester]}` +
                  ` can be found at ${url}`,
              })}`}
            >
              <Mail className="svg" /> Send Email
            </a>
          </div>
          <div className="col-sm-4">
            <h3 className={styles.shareHeading}>Via messaging apps</h3>

            <a
              className="btn btn-outline-primary btn-block"
              href={`https://api.whatsapp.com/send?${qs.stringify({
                text: `My timetable: ${url}`,
              })}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              WhatsApp
            </a>

            <a
              className="btn btn-outline-primary btn-block"
              href={`https://t.me/share/url?${qs.stringify({ url })}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { isOpen, shortUrl } = this.state;

    return (
      <Fragment>
        <button
          type="button"
          className="btn btn-outline-primary btn-svg"
          onClick={this.openModal}
          onMouseOver={this.loadShortUrl}
          onFocus={this.loadShortUrl}
        >
          <Repeat className="svg svg-small" />
          Share/Sync
        </button>

        <Modal isOpen={isOpen} onRequestClose={this.closeModal} animate>
          <CloseButton absolutePositioned onClick={this.closeModal} />
          <div className={styles.header}>
            <Repeat />

            <h3>Share/Sync Your Timetable</h3>
            <p>
              Send this link to your friends to share your timetable or <br />
              to yourself to keep your timetable synced on all devices.
            </p>
          </div>

          {shortUrl ? this.renderSharing(shortUrl) : <LoadingSpinner />}
        </Modal>
      </Fragment>
    );
  }
}
