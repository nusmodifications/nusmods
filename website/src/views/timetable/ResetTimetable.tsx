import * as React from 'react';
import { XSquare } from 'react-feather';

import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';

import styles from './ShareTimetable.scss';

type Props = {
  resetTimetable: () => void;
};

type State = {
  isOpen: boolean;
};

export default class ResetTimetable extends React.PureComponent<Props, State> {
  override state: State = {
    isOpen: false,
  };

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false,
    });

  override render() {
    const { isOpen } = this.state;
    const resetTimetable = () => {
      this.props.resetTimetable();
      this.closeModal();
    };

    return (
      <>
        <button type="button" className="btn btn-outline-primary btn-svg" onClick={this.openModal}>
          <XSquare className="svg svg-small" />
          Reset
        </button>

        <Modal isOpen={isOpen} onRequestClose={this.closeModal} animate>
          <CloseButton absolutePositioned onClick={this.closeModal} />
          <div className={styles.header}>
            <XSquare />

            <h3>Do you want to reset your timetable?</h3>
            <p>
              This will permanently remove all courses that are in the timetable for the current
              semester.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => resetTimetable()}
          >
            Reset
          </button>
        </Modal>
      </>
    );
  }
}
