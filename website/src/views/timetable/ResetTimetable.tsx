import * as React from 'react';
import { XSquare } from 'react-feather';

import type { SemTimetableConfig } from 'types/timetables';
import type { Semester, ModuleCode} from 'types/modules';

import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';

import styles from './ShareTimetable.scss';


type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;

  removeModule: (moduleCode: ModuleCode) => void;
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

    const removeAllModules = (timetable: SemTimetableConfig) => {
      const moduleCodes = Object.keys(timetable);
    
      for (const key in moduleCodes) {
        this.props.removeModule(moduleCodes[key]);
      }
        this.props.resetTombstone();
        this.closeModal();
    }

    return (
      <div>
            <a
              className="btn btn-outline-primary btn-block btn-svg" onClick={() => removeAllModules(this.props.timetable)}
            >
              Yes, Reset My Timetable 
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

          {this.renderReset()}
        </Modal>
      </>
    );
  }
}
