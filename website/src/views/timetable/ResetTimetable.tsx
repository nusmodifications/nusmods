import * as React from 'react';
import {  XSquare } from 'react-feather';

import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';

import styles from './ShareTimetable.scss';


type Props = {
  resetModules: () => void;
  resetTombstone: () => void;
};

type State = {
  isOpen: boolean;
};


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

  renderReset() {

    const resetTimetable = () => {
      this.props.resetModules();
      
      // const moduleCodes = Object.keys(timetable);
    
      // for (const key in moduleCodes) {
      //   this.props.removeModule(moduleCodes[key]);
      // }
        this.props.resetTombstone();
        this.closeModal();
    }

    return (
            <button
            type="button"
            className="btn btn-outline-primary btn-block"
            onClick={() => resetTimetable()}
            >
              Yes, Reset My Timetable 
            </button>

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

          {this.renderReset()}
        </Modal>
      </>
    );
  }
}
