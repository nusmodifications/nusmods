import * as React from 'react';
import axios from 'axios';
import classnames from 'classnames';
import qs from 'query-string';
import { Copy, Mail, Maximize2, Minimize2, Repeat } from 'react-feather';
import type { QRCodeSVG } from 'qrcode.react';

import type { SemTimetableConfig } from 'types/timetables';
import type { ModuleCode, Semester } from 'types/modules';

import config from 'config';
import { absolutePath, timetableShare } from 'views/routes/paths';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import LoadingSpinner from 'views/components/LoadingSpinner';
import retryImport from 'utils/retryImport';

import Tooltip from 'views/components/Tooltip';
import styles from './ShareTimetable.scss';

type CopyState = 'NOT_COPIED' | 'COPY_SUCCESS' | 'COPY_FAIL';
const NOT_COPIED: CopyState = 'NOT_COPIED';
const COPY_SUCCESS: CopyState = 'COPY_SUCCESS';
const COPY_FAIL: CopyState = 'COPY_FAIL';

type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;
  hiddenModules: ModuleCode[];
};

type State = {
  isOpen: boolean;
  urlCopied: CopyState;
  shortUrl: string | null;
  fullUrl: string | null;
  isFullUrl: boolean;
  isLoading: boolean;
};

function shareUrl(
  semester: Semester,
  timetable: SemTimetableConfig,
  hiddenModules: ModuleCode[],
): string {
  return absolutePath(timetableShare(semester, timetable, hiddenModules));
}

function getToolTipContent(shortUrl: string | null, isFullUrl: boolean, isLoading: boolean) {
  if (isLoading) {
    return 'Shortening link';
  }

  if (!shortUrl) {
    return 'Link shortener temporarily unavailable';
  }

  if (isFullUrl) {
    return 'Shorten link';
  }

  return 'Show original link';
}

// So that I don't keep typing 'shortUrl' instead
export const SHORT_URL_KEY = 'shorturl';

export default class ShareTimetable extends React.PureComponent<Props, State> {
  // React QR component is lazy loaded for performance
  static QRCode: typeof QRCodeSVG | null;

  // Save a copy of the current URL to detect when URL changes
  url: string | null = null;

  urlInput = React.createRef<HTMLInputElement>();

  override state: State = {
    isOpen: false,
    urlCopied: NOT_COPIED,
    shortUrl: null,
    fullUrl: null,
    isFullUrl: true,
    isLoading: false,
  };

  override componentDidMount() {
    if (!ShareTimetable.QRCode) {
      retryImport(() => import(/* webpackChunkName: "export" */ 'qrcode.react')).then((module) => {
        ShareTimetable.QRCode = module.QRCodeSVG;
        this.forceUpdate();
      });
    }
  }

  loadUrl = () => {
    const { semester, timetable, hiddenModules } = this.props;
    const url = shareUrl(semester, timetable, hiddenModules);

    // Don't do anything if the long URL has not changed
    if (this.url === url) return;

    const showFullUrl = () => this.setState({ fullUrl: url, isFullUrl: true });
    this.url = url;

    // Only try to retrieve shortUrl if the user is online
    if (!navigator.onLine) {
      showFullUrl();
      return;
    }

    this.setState({ fullUrl: url, shortUrl: null, isFullUrl: true, isLoading: true });

    axios
      .get('/api/shorturl', { params: { url }, timeout: 8000 })
      .then(({ data }) => {
        if (data[SHORT_URL_KEY]) {
          this.setState({
            shortUrl: data[SHORT_URL_KEY],
            isFullUrl: false,
            isLoading: false,
          });
        } else {
          this.setState({ isLoading: false });
        }
      })
      // Cannot get short URL - just use long URL instead
      .catch(() => {
        this.setState({ isLoading: false });
      });
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

  toggleShortenUrl = () => {
    this.setState((prevState) => ({
      isFullUrl: !prevState.isFullUrl,
      urlCopied: NOT_COPIED,
    }));
  };

  renderSharing(fullUrl: string, shortUrl: string | null, isFullUrl: boolean, isLoading: boolean) {
    const { semester } = this.props;
    const url = isFullUrl ? fullUrl : shortUrl ?? fullUrl;
    const toggleUrlButton = isFullUrl ? <Minimize2 /> : <Maximize2 />;

    return (
      <div>
        <div className={classnames('input-group input-group-lg', styles.linkInputGroup)}>
          <input
            value={url}
            className={classnames('form-control', styles.url)}
            ref={this.urlInput}
            readOnly
          />
          <Tooltip content={getToolTipContent(shortUrl, isFullUrl, isLoading)} touch="hold">
            <span className="input-group-append">
              <button
                className={classnames('btn btn-primary', styles.buttonContainer)}
                type="button"
                aria-label="Shorten URL"
                onClick={this.toggleShortenUrl}
                disabled={!shortUrl}
              >
                {isLoading ? <LoadingSpinner small white /> : toggleUrlButton}
              </button>
            </span>
          </Tooltip>
          <div className="input-group-append">
            <button
              className="btn btn-primary"
              type="button"
              aria-label="Copy URL"
              onClick={this.copyText}
            >
              <Copy />
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
              {ShareTimetable.QRCode && <ShareTimetable.QRCode size={172} value={url} />}
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

  override render() {
    const { fullUrl, isLoading, isOpen, shortUrl, isFullUrl } = this.state;

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
              Send this link to your friends to share your timetable or <br />
              to yourself to keep your timetable synced on all devices.
            </p>
          </div>

          {fullUrl && this.renderSharing(fullUrl, shortUrl, isFullUrl, isLoading)}
        </Modal>
      </>
    );
  }
}
