import * as React from 'react';
import classnames from 'classnames';
import qs from 'query-string';
import axios from 'axios';
import { QRCodeProps } from 'react-qr-svg';

import { Timetable } from './meetups';
import { Semester } from 'types/modules';

import config from 'config';
import { absolutePath, meetupsShare } from 'views/routes/paths';
import { Copy, Mail, Repeat } from 'react-feather';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import LoadingSpinner from 'views/components/LoadingSpinner';
import retryImport from 'utils/retryImport';

import styles from './ShareMeetups.scss';

type CopyState = 'NOT_COPIED' | 'COPY_SUCCESS' | 'COPY_FAIL';
const NOT_COPIED: CopyState = 'NOT_COPIED';
const COPY_SUCCESS: CopyState = 'COPY_SUCCESS';
const COPY_FAIL: CopyState = 'COPY_FAIL';

type Props = {
  semester: Semester;
  timetable: Timetable;
};

type State = {
  isOpen: boolean;
  urlCopied: CopyState;
  url: string | null;
};

function shareUrl(semester: Semester, timetable: Timetable): string {
  return absolutePath(meetupsShare(semester, timetable));
}

export default class ShareMeetups extends React.PureComponent<Props, State> {
  // React QR component is lazy loaded for performance
  static QRCode: React.ComponentType<QRCodeProps> | null;

  // Save a copy of the current URL to detect when URL changes
  url: string | null = null;

  urlInput = React.createRef<HTMLInputElement>();

  state: State = {
    isOpen: false,
    urlCopied: NOT_COPIED,
    url: null,
  };

  componentDidMount() {
    if (!ShareMeetups.QRCode) {
      retryImport(() => import(/* webpackChunkName: "export" */ 'react-qr-svg')).then((module) => {
        ShareMeetups.QRCode = module.QRCode;
        this.forceUpdate();
      });
    }
  }

  loadUrl = () => {
    const { semester, timetable } = this.props;
    const url = shareUrl(semester, timetable);
    this.setState({ url: url });
  };

  openModal = () => {
    this.loadUrl();
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
              {ShareMeetups.QRCode && <ShareMeetups.QRCode value={url} />}
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
                text: `My meetup: ${url}`,
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
    const { isOpen, url } = this.state;
    return (
      <>
        <button
          type="button"
          className="btn btn-outline-primary btn-svg"
          onClick={this.openModal}
          onMouseOver={this.loadUrl}
          onFocus={this.loadUrl}
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
              Send this link to your friends to share your available slots to make it easy to find a
              common time to meet up.
            </p>
          </div>

          {url ? this.renderSharing(url) : <LoadingSpinner />}
        </Modal>
      </>
    );
  }
}
