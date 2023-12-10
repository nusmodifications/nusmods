import * as React from 'react';
import axios from 'axios';
import classnames from 'classnames';
import qs from 'query-string';
import { Mail, XSquare } from 'react-feather';
import type { QRCodeProps } from 'react-qr-svg';

import type { SemTimetableConfig } from 'types/timetables';
import type { Semester } from 'types/modules';

import config from 'config';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';

import styles from './ShareTimetable.scss';


type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;
};

type State = {
  isOpen: boolean;
};



// So that I don't keep typing 'shortUrl' instead
export const SHORT_URL_KEY = 'shorturl';

export default class ResetTimetable extends React.PureComponent<Props, State> {


  override state: State = {
    isOpen: false
  };




  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false
    });


  renderSharing() {
    const { semester } = this.props;

    return (
      <div>
            <a
              className="btn btn-outline-primary btn-block btn-svg"
            >
              <Mail className="svg" /> Yes, Reset My Timetable 
            </a>
      </div>
    );
  }

  override render() {
    const { isOpen } = this.state;

    return (
      <>
        <button
          type="button"
          className="btn btn-outline-primary btn-svg"
          onClick={this.openModal}
        >
          <XSquare className="svg svg-small" />
          Reset
        </button>

        <Modal isOpen={isOpen} onRequestClose={this.closeModal} animate>
          <CloseButton absolutePositioned onClick={this.closeModal} />
          <div className={styles.header}>
            <XSquare />

            <h3>Reset Timetable?</h3>
            <p>
              This will remove all added modules for the current semester's timetable. <br />
              This action cannot be undone.
            </p>
          </div>

          {this.renderSharing()}
        </Modal>
      </>
    );
  }
}
